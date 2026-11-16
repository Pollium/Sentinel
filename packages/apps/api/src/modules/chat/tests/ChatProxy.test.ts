import Provider from '@/modules/providers/models/Provider';
import FakeUpstream from '@tests/fake-upstream';
import SecretCipher from '@readable/services/SecretCipher';
import { config } from '@/shared/config';
import { providerHealth } from '@/modules/providers/services/pool/ProviderHealth';
import { useApp } from '@tests/harness';
import { CLIENT_SECRET, pricedModel, seedApiKey, seedProvider } from '@tests/seed';
import { waitForFailure, waitForUsage } from '@tests/wait-for-usage';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('chat completions proxy', () => {
    const ctx = useApp();
    const upstream = new FakeUpstream([{ method: 'POST', path: '/v1/chat/completions' }]);
    const cipher = new SecretCipher(config.encryptionKey);

    beforeAll(async () => {
        await upstream.start();
    });

    afterAll(async () => {
        await upstream.stop();
    });

    beforeEach(async () => {
        upstream.reset();
        await seedApiKey();
    });

    const providerDefaults = (): Partial<Provider> => ({
        baseUrl: `${upstream.baseUrl}/v1`,
        encryptedApiKey: cipher.encrypt('sk-provider'),
        models: [pricedModel('m1', { inputPricePerMillion: 1, outputPricePerMillion: 2 })]
    });

    const seedChatProvider = (overrides: Partial<Provider> = {}) =>
        seedProvider('chat', { ...providerDefaults(), ...overrides });

    const post = async (payload: unknown, key: string | null = CLIENT_SECRET) => {
        return await ctx.app.inject({
            method: 'POST',
            url: '/v1/chat/completions',
            headers: key === null ? {} : { authorization: `Bearer ${key}` },
            payload: payload as object
        });
    };

    const callBody = (index: number): Record<string, unknown> => {
        return upstream.calls[index].body as Record<string, unknown>;
    };

    it('forwards the completion to the provider and returns its response', async () => {
        const provider = await seedChatProvider();
        upstream.enqueue({
            status: 200,
            json: {
                id: 'cmpl-1',
                choices: [],
                usage: { prompt_tokens: 5, completion_tokens: 7, prompt_tokens_details: { cached_tokens: 2 } }
            }
        });

        const res = await post({ model: 'm1', messages: [{ role: 'user', content: 'hi' }] });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toMatchObject({ id: 'cmpl-1' });
        expect(res.headers['x-gateway-provider']).toBe(provider.name);
        expect(upstream.calls).toHaveLength(1);
        expect(upstream.calls[0].headers.authorization).toBe('Bearer sk-provider');
        expect(callBody(0).messages).toEqual([{ role: 'user', content: 'hi' }]);

        const usage = await waitForUsage(provider.id);
        expect(usage).toMatchObject({
            kind: 'chat',
            model: 'm1',
            inputTokens: 5,
            cachedTokens: 2,
            outputTokens: 7,
            status: 200
        });
    });

    it('waits out a whole answer that is not streamed, however long it takes', async () => {
        await seedChatProvider();
        await seedChatProvider();
        const timer = config.upstreamFirstByteTimeoutMs;
        config.upstreamFirstByteTimeoutMs = 50;
        upstream.enqueue({ status: 200, json: { id: 'cmpl-slow', choices: [] }, afterMs: 200 });

        const res = await post({ model: 'm1', messages: [{ role: 'user', content: 'hi' }] });
        config.upstreamFirstByteTimeoutMs = timer;

        expect(res.json()).toMatchObject({ id: 'cmpl-slow' });
        expect(upstream.calls).toHaveLength(1);
    });

    it('attributes the request to the key that made it', async () => {
        const provider = await seedChatProvider();
        const key = await seedApiKey('snt_second-client', { name: 'Second client' });
        upstream.enqueue({ status: 200, json: { id: 'cmpl-1', choices: [] } });

        await post({ model: 'm1' }, 'snt_second-client');

        expect((await waitForUsage(provider.id)).apiKeyId).toBe(key.id);
    });

    it('rewrites the model through the provider map', async () => {
        await seedChatProvider({ modelMap: { m1: 'vendor/m1' } });
        upstream.enqueue({ status: 200, json: { id: 'cmpl-2', choices: [] } });

        await post({ model: 'm1' });

        expect(callBody(0).model).toBe('vendor/m1');
    });

    it('rejects a model that no provider serves', async () => {
        await seedChatProvider();

        const res = await post({ model: 'nope' });

        expect(res.statusCode).toBe(404);
        expect(res.json()).toMatchObject({ error: { type: 'invalid_request_error', code: 'model_not_found' } });
        expect(upstream.calls).toHaveLength(0);
    });

    it('fails over to another provider on a server error', async () => {
        await seedChatProvider({ name: 'Alpha', encryptedApiKey: cipher.encrypt('sk-alpha') });
        await seedChatProvider({ name: 'Beta', encryptedApiKey: cipher.encrypt('sk-beta') });
        upstream.enqueue({ status: 500, json: { error: 'boom' } });
        upstream.enqueue({ status: 200, json: { id: 'cmpl-3', choices: [] } });

        const res = await post({ model: 'm1' });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toMatchObject({ id: 'cmpl-3' });
        expect(upstream.calls).toHaveLength(2);
        expect(upstream.calls[0].headers.authorization).not.toBe(upstream.calls[1].headers.authorization);
    });

    it('does not fail over on a terminal client error', async () => {
        await seedChatProvider({ name: 'Alpha' });
        await seedChatProvider({ name: 'Beta' });
        upstream.enqueue({ status: 400, json: { error: 'bad request' } });

        const res = await post({ model: 'm1' });

        expect(res.statusCode).toBe(400);
        expect(res.json()).toEqual({ error: 'bad request' });
        expect(upstream.calls).toHaveLength(1);
    });

    const unsupportedCeiling = {
        status: 400,
        json: {
            error: {
                message: "Unsupported parameter: 'max_tokens' is not supported with this model.",
                type: 'invalid_request_error',
                param: 'max_tokens',
                code: 'unsupported_parameter'
            }
        }
    };

    it('retries the ceiling as max_completion_tokens when the provider rejects max_tokens', async () => {
        const provider = await seedChatProvider();
        upstream.enqueue(unsupportedCeiling);
        upstream.enqueue({ status: 200, json: { id: 'cmpl-4', choices: [] } });

        const res = await post({ model: 'm1', max_tokens: 512 });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toMatchObject({ id: 'cmpl-4' });
        expect(upstream.calls).toHaveLength(2);
        expect(callBody(0).max_tokens).toBe(512);
        expect(callBody(1)).not.toHaveProperty('max_tokens');
        expect(callBody(1).max_completion_tokens).toBe(512);
        expect((await waitForUsage(provider.id)).status).toBe(200);
    });

    it('sends the modern ceiling up front once a provider has rejected the legacy one', async () => {
        await seedChatProvider();
        upstream.enqueue(unsupportedCeiling);
        upstream.enqueue({ status: 200, json: { id: 'cmpl-5', choices: [] } });
        await post({ model: 'm1', max_tokens: 512 });

        upstream.enqueue({ status: 200, json: { id: 'cmpl-6', choices: [] } });
        const res = await post({ model: 'm1', max_tokens: 256 });

        expect(res.statusCode).toBe(200);
        expect(upstream.calls).toHaveLength(3);
        expect(callBody(2)).not.toHaveProperty('max_tokens');
        expect(callBody(2).max_completion_tokens).toBe(256);
    });

    it('drops the reasoning a client echoes back, which Cerebras rejects the whole turn over', async () => {
        await seedChatProvider();
        upstream.enqueue({ status: 200, json: { id: 'cmpl-7', choices: [] } });

        const res = await post({
            model: 'm1',
            messages: [
                { role: 'user', content: 'What is the weather in Lima?' },
                {
                    role: 'assistant',
                    content: null,
                    reasoning_content: 'I should call get_weather',
                    tool_calls: [{ id: 't1', type: 'function', function: { name: 'get_weather', arguments: '{}' } }]
                },
                { role: 'tool', tool_call_id: 't1', content: 'Error: get_weather needs a city' }
            ]
        });

        expect(res.statusCode).toBe(200);
        const sent = callBody(0).messages as Record<string, unknown>[];
        expect(sent[1]).not.toHaveProperty('reasoning_content');
        expect(sent[1].tool_calls).toHaveLength(1);
        expect(sent[2]).toMatchObject({ role: 'tool', tool_call_id: 't1' });
    });

    it('repairs a streamed request too and then passes the SSE through', async () => {
        await seedChatProvider();
        const sse = 'data: {"choices":[{"delta":{"content":"hi"}}]}\n\ndata: [DONE]\n\n';
        upstream.enqueue(unsupportedCeiling);
        upstream.enqueue({ status: 200, sse });

        const res = await post({ model: 'm1', stream: true, max_tokens: 512 });

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('text/event-stream');
        expect(res.body).toBe(sse);
        expect(callBody(1).max_completion_tokens).toBe(512);
    });

    it('forwards an unrelated 400 without retrying the ceiling', async () => {
        const provider = await seedChatProvider();
        upstream.enqueue({
            status: 400,
            json: { error: { message: 'messages is required', type: 'invalid_request_error', param: 'messages' } }
        });

        const res = await post({ model: 'm1', max_tokens: 512 });

        expect(res.statusCode).toBe(400);
        expect(res.json()).toMatchObject({ error: { param: 'messages' } });
        expect(upstream.calls).toHaveLength(1);
        expect((await waitForUsage(provider.id)).status).toBe(400);
    });

    it('passes SSE bytes through untouched and records the streamed usage', async () => {
        const provider = await seedChatProvider();
        const sse = [
            'data: {"model":"vendor/m1","choices":[{"delta":{"content":"He"}}]}\n\n',
            'data: {"model":"vendor/m1","choices":[{"delta":{"content":"llo"}}]}\n\n',
            'data: {"model":"vendor/m1","choices":[],"usage":{"prompt_tokens":4,"completion_tokens":2,"prompt_tokens_details":{"cached_tokens":1}}}\n\n',
            'data: [DONE]\n\n'
        ].join('');
        upstream.enqueue({ status: 200, sse });

        const res = await post({ model: 'm1', stream: true });

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('text/event-stream');
        expect(res.headers['x-gateway-provider']).toBe(provider.name);
        expect(res.body).toBe(sse);

        const usage = await waitForUsage(provider.id);
        expect(usage).toMatchObject({ inputTokens: 4, cachedTokens: 1, outputTokens: 2, status: 200 });
    });

    it('rejects a request with no api key', async () => {
        const res = await post({ model: 'm1' }, null);

        expect(res.statusCode).toBe(401);
        expect(res.json()).toEqual({ error: 'ApiKey::Unauthorized' });
        expect(upstream.calls).toHaveLength(0);
    });

    it('rejects an api key nobody issued', async () => {
        await seedChatProvider();

        const res = await post({ model: 'm1' }, 'snt_forged');

        expect(res.statusCode).toBe(401);
        expect(upstream.calls).toHaveLength(0);
    });

    it('keeps a provider in the pool when it refuses a request over its content policy', async () => {
        await seedChatProvider({ name: 'Only' });
        const refusal = { error: { message: 'The AI model (Claude Sonnet 5.5) refused to process this request due to its content safety policies.' } };
        for(let i = 0; i < 3; i++) upstream.enqueue({ status: 502, json: refusal });
        upstream.enqueue({ status: 200, json: { id: 'cmpl-after', choices: [] } });

        const refused = [];
        for(let i = 0; i < 3; i++) refused.push(await post({ model: 'm1' }));
        const served = await post({ model: 'm1' });

        expect(refused.map((res) => res.statusCode)).toEqual([502, 502, 502]);
        expect(refused[0].json()).toEqual(refusal);
        expect(served.statusCode).toBe(200);
        expect(served.json()).toMatchObject({ id: 'cmpl-after' });
        expect(upstream.calls).toHaveLength(4);
    });

    it('lets another provider answer what one refused', async () => {
        await seedChatProvider({ name: 'Alpha', encryptedApiKey: cipher.encrypt('sk-a') });
        await seedChatProvider({ name: 'Beta', encryptedApiKey: cipher.encrypt('sk-b') });
        upstream.enqueue({ status: 502, json: { error: { message: 'refused to process this request due to its content safety policies' } } });
        upstream.enqueue({ status: 200, json: { id: 'cmpl-other', choices: [] } });

        const res = await post({ model: 'm1' });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toMatchObject({ id: 'cmpl-other' });
        expect(upstream.calls[0].headers.authorization).not.toBe(upstream.calls[1].headers.authorization);
    });

    it('answers 503 when no chat provider is active', async () => {
        const res = await post({ model: 'm1' });

        expect(res.statusCode).toBe(503);
        expect(res.json()).toMatchObject({ error: { type: 'server_error' } });
    });

    it('records the attempt a provider failed against it, with the caller and the model', async () => {
        const key = await seedApiKey('snt_failover-secret');
        const provider = await seedChatProvider();
        upstream.enqueue({ status: 429, json: {} });

        await post({ model: 'm1' }, 'snt_failover-secret');

        expect(await waitForFailure(provider.id)).toMatchObject({
            apiKeyId: key.id,
            kind: 'chat',
            model: 'm1',
            cause: 'rejected',
            status: 429
        });
    });

    it('records a provider that never answered as unreachable', async () => {
        const provider = await seedChatProvider({ baseUrl: 'http://127.0.0.1:9/v1' });

        const res = await post({ model: 'm1' });

        expect(res.statusCode).toBe(503);
        expect(await waitForFailure(provider.id)).toMatchObject({ cause: 'unreachable', status: 0 });
    });

    it('records a provider out of credits without counting it as a failure in a row', async () => {
        const provider = await seedChatProvider();
        upstream.enqueue({ status: 402, json: {} });

        await post({ model: 'm1' });

        expect(await waitForFailure(provider.id)).toMatchObject({ cause: 'out-of-credits', status: 402 });
        expect(providerHealth.stateOf(provider.id)).toMatchObject({ consecutiveFailures: 0, isOutOfCredits: true });
    });

    it('answers 503 once every provider has failed', async () => {
        await seedChatProvider();
        upstream.enqueue({ status: 500, json: {} });

        const res = await post({ model: 'm1' });

        expect(res.statusCode).toBe(503);
        expect(upstream.calls).toHaveLength(1);
    });
});
