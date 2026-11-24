import Provider from '@/modules/providers/models/Provider';
import { SecretCipher } from '@pollium/readable/auth/secrets';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { config } from '@/shared/config';
import { providerHealth } from '@/modules/providers/services/pool/ProviderHealth';
import { uuid } from '@tests/uuid';
import { useApp } from '@tests/harness';
import { CLIENT_SECRET, pricedModel, seedApiKey, seedProvider } from '@tests/seed';
import { OPERATOR_ID, operatorHeaders, seedOperator } from '@tests/operators';
import { describe, expect, it, beforeEach } from 'vitest';

const ADMIN = operatorHeaders();

describe('provider admin routes', () => {
    const ctx = useApp();
    beforeEach(() => seedOperator({ id: OPERATOR_ID }));

    const providersOf = async (kind: string) => {
        const response = await ctx.app.inject({ method: 'GET', url: `/tower/kinds/${kind}/providers`, headers: ADMIN });
        return response.json<{ data: PublicGatewayProvider[] }>().data;
    };

    it('rejects a request without the admin key', async () => {
        const response = await ctx.app.inject({ method: 'GET', url: '/tower/kinds/chat/providers' });

        expect(response.statusCode).toBe(401);
    });

    it('rejects a client key on the admin surface', async () => {
        await seedApiKey();

        const response = await ctx.app.inject({
            method: 'GET',
            url: '/tower/kinds/chat/providers',
            headers: { authorization: `Bearer ${CLIENT_SECRET}` }
        });

        expect(response.statusCode).toBe(401);
    });

    it('lists only the providers of the requested kind', async () => {
        await seedProvider('chat', { name: 'Alpha' });
        await seedProvider('chat', { name: 'Beta' });
        await seedProvider('voice', { name: 'Deepgram' });

        expect((await providersOf('chat')).map((provider) => provider.name)).toEqual(['Alpha', 'Beta']);
        expect((await providersOf('voice')).map((provider) => provider.name)).toEqual(['Deepgram']);
    });

    it('creates a provider with an encrypted key and never returns it', async () => {
        const response = await ctx.app.inject({
            method: 'POST',
            url: '/tower/kinds/chat/providers',
            headers: ADMIN,
            payload: {
                name: 'OpenRouter',
                baseUrl: 'https://openrouter.ai/api/v1',
                apiKey: 'sk-or-secret',
                isActive: true,
                models: [pricedModel('gpt-5-mini', { inputPricePerMillion: 0.25 })],
                modelMap: { 'gpt-5-mini': 'openai/gpt-5-mini' }
            }
        });

        expect(response.statusCode).toBe(201);
        expect(response.body).not.toContain('sk-or-secret');
        expect(response.body).not.toContain('encryptedApiKey');
        expect(response.json<{ data: PublicGatewayProvider }>().data).toMatchObject({
            kind: 'chat',
            models: [{ id: 'gpt-5-mini', inputPricePerMillion: 0.25 }]
        });

        const stored = await Provider.findOneByOrFail({ id: response.json<{ data: PublicGatewayProvider }>().data.id });
        expect(new SecretCipher(config.encryptionKey).decrypt(stored.encryptedApiKey)).toBe('sk-or-secret');
    });

    it('rejects a provider without a name', async () => {
        const response = await ctx.app.inject({
            method: 'POST',
            url: '/tower/kinds/chat/providers',
            headers: ADMIN,
            payload: { name: '', baseUrl: 'https://openrouter.ai/api/v1', apiKey: 'sk-or-secret', isActive: true, models: [], modelMap: {} }
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchObject({ error: 'Request::ValidationFailed', errors: { name: 'Required' } });
        expect(await Provider.count()).toBe(0);
    });

    it('keeps the stored key when an update omits it', async () => {
        const provider = await seedProvider('chat');

        const response = await ctx.app.inject({
            method: 'PATCH',
            url: `/tower/providers/${provider.id}`,
            headers: ADMIN,
            payload: { isActive: false }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json<{ data: PublicGatewayProvider }>().data.isActive).toBe(false);

        const stored = await Provider.findOneByOrFail({ id: provider.id });
        expect(new SecretCipher(config.encryptionKey).decrypt(stored.encryptedApiKey)).toBe('sk-test');
    });

    it('reports the live cooldown of a provider', async () => {
        const provider = await seedProvider('chat');
        providerHealth.recordFailure(provider.id);
        providerHealth.recordFailure(provider.id);

        expect((await providersOf('chat'))[0]).toMatchObject({ consecutiveFailures: 2, cooldownUntil: null });

        providerHealth.recordFailure(provider.id);

        expect((await providersOf('chat'))[0]?.cooldownUntil).not.toBeNull();
    });

    it('deletes a provider', async () => {
        const provider = await seedProvider('search');

        const response = await ctx.app.inject({
            method: 'DELETE',
            url: `/tower/providers/${provider.id}`,
            headers: ADMIN
        });

        expect(response.statusCode).toBe(204);
        expect(await Provider.countBy({ id: provider.id })).toBe(0);
    });

    it('answers 404 for a provider that does not exist', async () => {
        const response = await ctx.app.inject({ method: 'DELETE', url: `/tower/providers/${uuid(1)}`, headers: ADMIN });

        expect(response.statusCode).toBe(404);
        expect(response.json<{ error: string }>().error).toContain('Provider::NotFound');
    });
});
