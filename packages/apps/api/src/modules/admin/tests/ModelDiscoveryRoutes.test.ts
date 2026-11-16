import FakeUpstream from '@tests/fake-upstream';
import { DiscoveredModels } from '@sentinel/contracts/providers/domain';
import { useApp } from '@tests/harness';
import { seedProvider } from '@tests/seed';
import { OPERATOR_ID, operatorHeaders, seedOperator } from '@tests/operators';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const ADMIN = operatorHeaders();

describe('model discovery', () => {
    const ctx = useApp();
    const upstream = new FakeUpstream([{ method: 'GET', path: '/models' }]);

    beforeAll(() => upstream.start());
    afterAll(() => upstream.stop());
    beforeEach(async () => {
        await seedOperator({ id: OPERATOR_ID });
        upstream.reset();
    });

    const discover = async (payload: Record<string, unknown>) => {
        const response = await ctx.app.inject({
            method: 'POST',
            url: '/tower/models/discover',
            headers: ADMIN,
            payload
        });

        return response;
    };

    it('rejects a request without the admin key', async () => {
        const response = await ctx.app.inject({
            method: 'POST',
            url: '/tower/models/discover',
            payload: { baseUrl: upstream.baseUrl, apiKey: 'sk-typed' }
        });

        expect(response.statusCode).toBe(401);
    });

    it('reads the ids the upstream lists, sorted and deduplicated', async () => {
        upstream.enqueue({
            status: 200,
            json: {
                data: [
                    { id: 'openai/gpt-5-mini' },
                    { id: 'meta/llama-3.1-8b' },
                    { id: 'openai/gpt-5-mini' },
                    { id: '' },
                    { name: 'no id at all' }
                ]
            }
        });

        const response = await discover({ baseUrl: upstream.baseUrl, apiKey: 'sk-typed' });

        expect(response.statusCode).toBe(200);
        expect(response.json<{ data: DiscoveredModels }>().data.models.map((model) => model.id))
            .toEqual(['meta/llama-3.1-8b', 'openai/gpt-5-mini']);
    });

    it('converts the per-token prices an upstream publishes into prices per million', async () => {
        upstream.enqueue({
            status: 200,
            json: {
                data: [{
                    id: 'openai/gpt-5-mini',
                    pricing: { prompt: '0.00000025', completion: '0.000002', input_cache_read: '0.000000025' }
                }]
            }
        });

        const response = await discover({ baseUrl: upstream.baseUrl, apiKey: 'sk-typed' });

        expect(response.json<{ data: DiscoveredModels }>().data.models[0]).toEqual({
            id: 'openai/gpt-5-mini',
            inputPricePerMillion: 0.25,
            cachedInputPricePerMillion: 0.025,
            outputPricePerMillion: 2,
            contextWindow: null
        });
    });

    it('leaves a price blank when the upstream publishes none, or publishes a free model', async () => {
        upstream.enqueue({
            status: 200,
            json: {
                data: [
                    { id: 'no-pricing-at-all' },
                    { id: 'free', pricing: { prompt: '0', completion: '0' } },
                    { id: 'nonsense', pricing: { prompt: 'gratis', completion: '0.000001' } }
                ]
            }
        });

        const response = await discover({ baseUrl: upstream.baseUrl, apiKey: 'sk-typed' });
        const listed = response.json<{ data: DiscoveredModels }>().data.models;

        expect(listed[0]).toMatchObject({ inputPricePerMillion: null, outputPricePerMillion: null });
        expect(listed[1]).toMatchObject({ inputPricePerMillion: null, outputPricePerMillion: null });
        expect(listed[2]).toMatchObject({ inputPricePerMillion: null, outputPricePerMillion: 1 });
    });

    it('presents the key the caller typed, so an unsaved provider can be probed', async () => {
        upstream.enqueue({ status: 200, json: { data: [] } });

        await discover({ baseUrl: `${upstream.baseUrl}/`, apiKey: 'sk-typed' });

        expect(upstream.calls[0].url).toBe('/models');
        expect(upstream.calls[0].headers.authorization).toBe('Bearer sk-typed');
    });

    it('falls back to the stored key of a saved provider', async () => {
        const provider = await seedProvider('chat');
        upstream.enqueue({ status: 200, json: { data: [{ id: 'stored' }] } });

        const response = await discover({ baseUrl: upstream.baseUrl, providerId: provider.id });

        expect(response.statusCode).toBe(200);
        expect(upstream.calls[0].headers.authorization).toBe('Bearer sk-test');
    });

    it('refuses when it has neither a typed key nor a provider to read one from', async () => {
        const response = await discover({ baseUrl: upstream.baseUrl });

        expect(response.statusCode).toBe(400);
        expect(response.json<{ error: string }>().error).toContain('Provider::ModelsNeedKey');
    });

    it.each(['not-a-uuid', 'urn:uuid:0190f0e6-7c3a-7d6e-8f00-000000000001'])('rejects the provider id %s before reading any key', async (providerId) => {
        const response = await discover({ baseUrl: upstream.baseUrl, providerId });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchObject({ error: 'Request::ValidationFailed', errors: { providerId: expect.any(String) } });
        expect(upstream.calls).toHaveLength(0);
    });

    it('reports the status an upstream that refuses the listing answered with', async () => {
        upstream.enqueue({ status: 403, json: { error: 'forbidden' } });

        const response = await discover({ baseUrl: upstream.baseUrl, apiKey: 'sk-typed' });

        expect(response.statusCode).toBe(502);
        expect(response.json<{ error: string }>().error).toContain('Provider::ModelsRejected');
    });

    it('reports an upstream it cannot reach at all', async () => {
        const response = await discover({ baseUrl: 'http://127.0.0.1:1/v1', apiKey: 'sk-typed' });

        expect(response.statusCode).toBe(502);
        expect(response.json<{ error: string }>().error).toContain('Provider::ModelsUnreachable');
    });
});
