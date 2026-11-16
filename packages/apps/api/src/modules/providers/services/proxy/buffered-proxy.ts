import Provider from '../../models/Provider';
import ProviderExecutor from './ProviderExecutor';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { Attempt } from '../../contracts/domain/proxy';
import { activeProviders } from '../pool/active-providers';
import { usageRecorder } from '../pool/UsageRecorder';
import { trackInFlight } from './InFlight';
import { secretCipher } from '@/shared/cipher';
import { config } from '@/shared/config';
import { authenticateClient, AuthShape } from '@/modules/keys/services/authenticate';
import { FastifyReply, FastifyRequest } from 'fastify';

interface BufferedProxyOptions{
    kind: GatewayKind;
    ingress: AuthShape;
    providerAuth: (apiKey: string) => Record<string, string>;
    modelOf?: (url: string) => string;
}

export const bufferedProxyHandler = ({ kind, ingress, providerAuth, modelOf }: BufferedProxyOptions) => {
    const executor = new ProviderExecutor();

    return async (request: FastifyRequest, reply: FastifyReply) => {
        const apiKey = await authenticateClient(request.headers, ingress);
        trackInFlight(reply);

        const providers = await activeProviders(kind);

        const abort = new AbortController();
        request.raw.on('close', () => abort.abort());

        const startedAt = Date.now();
        const contentType = request.headers['content-type'];
        const body = request.body as Buffer | undefined;

        const build = (provider: Provider): Attempt => ({
            url: `${provider.baseUrl}${request.url}`,
            init: {
                method: request.method,
                headers: {
                    ...(contentType === undefined ? {} : { 'content-type': contentType }),
                    ...providerAuth(secretCipher.decrypt(provider.encryptedApiKey))
                },
                body: body === undefined || body.length === 0 ? undefined : body
            }
        });

        const model = modelOf?.(request.url) ?? kind;
        const execution = await executor.runBuffered({ providers, build, signal: abort.signal, log: request.log, caller: { apiKeyId: apiKey.id, model }, firstByteMs: config.upstreamFirstByteTimeoutMs });

        await usageRecorder.record({
            provider: execution.provider,
            apiKeyId: apiKey.id,
            kind,
            model,
            inputTokens: 0,
            cachedTokens: 0,
            outputTokens: 0,
            latencyMs: Date.now() - startedAt,
            status: execution.status
        }, request.log);

        reply.header('x-gateway-provider', execution.provider.name);
        if(execution.contentType !== null) reply.header('content-type', execution.contentType);
        return reply.status(execution.status).send(execution.body);
    };
};
