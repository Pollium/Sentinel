import Provider from '@/modules/providers/models/Provider';
import RuntimeError from '@readable/errors/RuntimeError';
import { ChatCompletionRequest, CompletionUsage } from '../contracts/domain/completion';
import { completionCeiling } from './CompletionCeiling';
import { reasoningShape } from './ReasoningShape';
import { tapSseUsage } from './StreamUsage';
import { secretCipher } from '@/shared/cipher';
import { BEARER_AUTH, authenticateClient } from '@/modules/keys/services/authenticate';
import { Attempt } from '@/modules/providers/contracts/domain/proxy';
import { activeProviders } from '@/modules/providers/services/pool/active-providers';
import { usageRecorder } from '@/modules/providers/services/pool/UsageRecorder';
import { trackInFlight } from '@/modules/providers/services/proxy/InFlight';
import ProviderExecutor, { StreamExecution } from '@/modules/providers/services/proxy/ProviderExecutor';
import { FastifyReply, FastifyRequest } from 'fastify';

export const CHAT_BODY_LIMIT = 20_000_000;

interface OpenAiErrorBody{
    error: {
        message: string;
        type: string;
        code?: string;
    };
}

interface CompletionResponse{
    usage?: CompletionUsage;
}

const sendOpenAiError = (reply: FastifyReply, status: number, message: string, type: string, code?: string) => {
    const body: OpenAiErrorBody = { error: { message, type, code } };
    return reply.status(status).send(body);
};

const usageOf = (payload: unknown): CompletionUsage | undefined => {
    if(typeof payload !== 'object' || payload === null) return undefined;
    return (payload as CompletionResponse).usage;
};

export default class ChatCompletionProxy{
    #executor = new ProviderExecutor();

    async handle(request: FastifyRequest, reply: FastifyReply){
        const apiKey = await authenticateClient(request.headers, BEARER_AUTH);
        trackInFlight(reply);

        const body = request.body as ChatCompletionRequest;

        let serving: Provider[];
        let execution: StreamExecution;
        const startedAt = Date.now();

        try{
            const providers = await activeProviders('chat');
            serving = providers.filter((provider) => provider.models.some((model) => model.id === body.model));
            if(serving.length === 0){
                return sendOpenAiError(reply, 404, `No provider serves ${body.model}`, 'invalid_request_error', 'model_not_found');
            }

            const abort = new AbortController();
            request.raw.on('close', () => abort.abort());

            const build = (provider: Provider): Attempt => {
                const model = provider.models.find((entry) => entry.id === body.model);

                return {
                    url: `${provider.baseUrl}/chat/completions`,
                    init: {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                            authorization: `Bearer ${secretCipher.decrypt(provider.encryptedApiKey)}`
                        },
                        body: JSON.stringify({
                            ...reasoningShape.apply(model, completionCeiling.shape(provider.id, body)),
                            model: provider.modelMap[body.model] ?? body.model
                        })
                    }
                };
            };

            const plan = { build, signal: abort.signal, log: request.log, caller: { apiKeyId: apiKey.id, model: body.model } };
            execution = await this.#executor.runStream({ ...plan, providers: serving });

            if(execution.response.status === 400){
                const rejection = Buffer.from(await execution.response.arrayBuffer());
                const { provider } = execution;

                if(completionCeiling.rejected(provider.id, body, rejection)){
                    completionCeiling.remember(provider.id);
                    request.log.info({ provider: provider.name }, 'gateway retrying the ceiling as max_completion_tokens');
                    execution = await this.#executor.runStream({ ...plan, providers: [provider] });
                }else{
                    execution = { provider, response: new Response(rejection, execution.response) };
                }
            }
        }catch(cause: unknown){
            if(cause instanceof RuntimeError){
                return sendOpenAiError(reply, cause.statusCode, cause.message, 'server_error');
            }
            throw cause;
        }

        const { provider, response } = execution;
        reply.header('x-gateway-provider', provider.name);

        const record = (inputTokens: number, cachedTokens: number, outputTokens: number) => {
            void usageRecorder.record({
                provider,
                apiKeyId: apiKey.id,
                kind: 'chat',
                model: body.model,
                inputTokens,
                cachedTokens,
                outputTokens,
                latencyMs: Date.now() - startedAt,
                status: response.status
            }, request.log);
        };

        if(body.stream !== true){
            const payload = await response.json();
            const usage = usageOf(payload);
            record(
                usage?.prompt_tokens ?? 0,
                usage?.prompt_tokens_details?.cached_tokens ?? 0,
                usage?.completion_tokens ?? 0
            );
            return reply.status(response.status).send(payload);
        }

        const upstream = response.body;
        if(upstream === null){
            return sendOpenAiError(reply, 502, 'Upstream returned no body', 'server_error');
        }

        const tap = tapSseUsage(upstream);
        let settled = false;
        const recordOnce = () => {
            if(settled) return;
            settled = true;
            record(tap.info.inputTokens, tap.info.cachedTokens, tap.info.outputTokens);
        };
        reply.raw.on('finish', recordOnce);
        reply.raw.on('close', recordOnce);

        reply.header('content-type', 'text/event-stream');
        reply.header('cache-control', 'no-cache');
        return reply.status(response.status).send(tap.stream);
    }
}
