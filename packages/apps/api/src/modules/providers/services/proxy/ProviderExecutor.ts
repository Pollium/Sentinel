import Provider from '../../models/Provider';
import { Attempt } from '../../contracts/domain/proxy';
import { PoolError } from '../../contracts/domain/errors';
import { pickProvider } from '../pool/pick-provider';
import { providerHealth } from '../pool/ProviderHealth';
import { failureRecorder, NO_STATUS } from '../pool/FailureRecorder';
import { GatewayFailureCause } from '@sentinel/contracts/usage/domain';
import { config } from '@/shared/config';
import { FastifyBaseLogger } from 'fastify';

const RETRYABLE_STATUSES = new Set([401, 403, 404, 408, 429, 500, 502, 503, 504]);
const PAYMENT_REQUIRED = 402;
const REFUSAL = /refused to process this request|content (safety|policy|filter)|safety polic/i;

interface AttemptCaller{
    apiKeyId: string;
    model: string;
}

interface ExecutionPlan{
    providers: Provider[];
    build: (provider: Provider) => Attempt;
    signal: AbortSignal;
    log: FastifyBaseLogger;
    caller: AttemptCaller;
}

export interface StreamExecution{
    provider: Provider;
    response: Response;
}

interface BufferedExecution{
    provider: Provider;
    status: number;
    contentType: string | null;
    body: Buffer;
}

const send = async ({ url, init }: Attempt, signal: AbortSignal): Promise<Response | null> => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    const timer = setTimeout(abort, config.upstreamFirstByteTimeoutMs);
    signal.addEventListener('abort', abort);

    try{
        return await fetch(url, { ...init, signal: controller.signal });
    }catch(cause: unknown){
        if(signal.aborted) throw cause;
        return null;
    }finally{
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
    }
};

const readBody = async (response: Response): Promise<Omit<BufferedExecution, 'provider'> | null> => {
    try{
        const body = Buffer.from(await response.arrayBuffer());
        return {
            status: response.status,
            contentType: response.headers.get('content-type'),
            body
        };
    }catch{
        return null;
    }
};

interface Refused{
    provider: Provider;
    response: Response;
}

const refusalOf = async (response: Response): Promise<Response | null> => {
    const text = await response.text().catch(() => '');

    return REFUSAL.test(text) ? new Response(text, { status: response.status, headers: response.headers }) : null;
};

export default class ProviderExecutor{
    runStream(plan: ExecutionPlan): Promise<StreamExecution>{
        return this.#run(plan, async (response) => ({ response }));
    }

    runBuffered(plan: ExecutionPlan): Promise<BufferedExecution>{
        return this.#run(plan, readBody);
    }

    async #run<T extends object>(plan: ExecutionPlan, commit: (response: Response) => Promise<T | null>): Promise<{ provider: Provider } & T>{
        const { providers, build, signal, log, caller } = plan;
        const excluded = new Set<string>();
        let refused: Refused | null = null;

        const remember = (provider: Provider, cause: GatewayFailureCause, status: number, startedAt: number) => {
            void failureRecorder.record({ provider, ...caller, cause, status, latencyMs: Date.now() - startedAt }, log);
        };

        const failed = (provider: Provider, cause: GatewayFailureCause, status: number, startedAt: number) => {
            log.warn({ provider: provider.name, cause, status }, 'gateway provider failed, trying the next');
            providerHealth.recordFailure(provider.id);
            remember(provider, cause, status, startedAt);
        };

        for(;;){
            const provider = pickProvider(providers, providerHealth, excluded);
            if(provider === null && refused !== null) return { provider: refused.provider, ...await this.#settled(commit, refused.response) };
            if(provider === null) throw PoolError.NoHealthyProvider();

            excluded.add(provider.id);

            const startedAt = Date.now();
            const response = await send(build(provider), signal);
            if(response === null){
                failed(provider, 'unreachable', NO_STATUS, startedAt);
                continue;
            }

            if(response.status === PAYMENT_REQUIRED){
                void response.body?.cancel();
                log.warn({ provider: provider.name }, 'gateway provider is out of credits, resting it and trying the next');
                providerHealth.recordOutOfCredits(provider.id);
                remember(provider, 'out-of-credits', response.status, startedAt);
                continue;
            }

            if(RETRYABLE_STATUSES.has(response.status)){
                const refusal = await refusalOf(response);
                if(refusal !== null){
                    log.warn({ provider: provider.name, status: response.status }, 'gateway provider refused this request, trying the next and keeping it in the pool');
                    refused = { provider, response: refusal };
                    continue;
                }

                failed(provider, 'rejected', response.status, startedAt);
                continue;
            }

            const result = await commit(response);
            if(result === null){
                failed(provider, 'unreadable', response.status, startedAt);
                continue;
            }

            providerHealth.recordSuccess(provider.id);
            return {
                provider,
                ...result
            };
        }
    }

    async #settled<T extends object>(commit: (response: Response) => Promise<T | null>, response: Response): Promise<T>{
        const result = await commit(response);
        if(result === null) throw PoolError.NoHealthyProvider();

        return result;
    }
}
