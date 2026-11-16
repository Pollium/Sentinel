import Usage from '@/modules/providers/models/Usage';
import FakeUpstream from '@tests/fake-upstream';
import SecretCipher from '@readable/services/SecretCipher';
import { config } from '@/shared/config';
import { usageRecorder } from '@/modules/providers/services/pool/UsageRecorder';
import { useApp } from '@tests/harness';
import { CLIENT_SECRET, seedApiKey, seedProvider } from '@tests/seed';
import { waitForUsage } from '@tests/wait-for-usage';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

describe('search proxy', () => {
    const ctx = useApp();
    const upstream = new FakeUpstream([{ method: 'GET', path: '/res/v1/llm/context' }]);
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

    const seedSearchProvider = () =>
        seedProvider('search', {
            baseUrl: upstream.baseUrl,
            encryptedApiKey: cipher.encrypt('brave-provider')
        });

    const search = async (token: string | null = CLIENT_SECRET) => ctx.app.inject({
        method: 'GET',
        url: '/res/v1/llm/context?q=typeorm&count=6&safesearch=moderate',
        headers: token === null ? {} : { 'x-subscription-token': token }
    });

    it('proxies the search to the provider and returns its results', async () => {
        const provider = await seedSearchProvider();
        const results = { context: { results: [{ url: 'https://typeorm.io', content: 'ORM' }] } };
        upstream.enqueue({ status: 200, json: results });

        const res = await search();

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual(results);
        expect(res.headers['x-gateway-provider']).toBe(provider.name);
        expect(upstream.calls).toHaveLength(1);
        expect(upstream.calls[0].url).toBe('/res/v1/llm/context?q=typeorm&count=6&safesearch=moderate');
        expect(upstream.calls[0].headers.authorization).toBeUndefined();

        const usage = await waitForUsage(provider.id);
        expect(usage).toMatchObject({ kind: 'search', model: 'search', status: 200 });
    });

    it('presents the provider key as the subscription token', async () => {
        await seedSearchProvider();
        upstream.enqueue({ status: 200, json: {} });

        await search();

        const call = upstream.calls[0];
        expect(call.headers['x-subscription-token']).toBe('brave-provider');
    });

    it('rejects a request with no api key', async () => {
        const res = await search(null);

        expect(res.statusCode).toBe(401);
        expect(res.json()).toEqual({ error: 'ApiKey::Unauthorized' });
        expect(upstream.calls).toHaveLength(0);
    });

    it('still answers with the results when their usage cannot be recorded', async () => {
        await seedSearchProvider();
        upstream.enqueue({ status: 200, json: { ok: true } });
        vi.spyOn(usageRecorder, 'write').mockRejectedValueOnce(new Error('usage store offline'));

        const res = await search();

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({ ok: true });
        expect(await Usage.count()).toBe(0);
    });
});
