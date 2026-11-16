import ApiKey from '@/modules/keys/models/ApiKey';
import Usage from '@/modules/providers/models/Usage';
import { IssuedGatewayApiKey, PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { BEARER_AUTH, authenticateClient } from '@/modules/keys/services/authenticate';
import { uuid } from '@tests/uuid';
import { useApp } from '@tests/harness';
import { seedApiKey, seedProvider } from '@tests/seed';
import { OPERATOR_ID, operatorHeaders, seedOperator } from '@tests/operators';
import { describe, expect, it, beforeEach } from 'vitest';

const ADMIN = operatorHeaders();

describe('api key admin routes', () => {
    const ctx = useApp();
    beforeEach(() => seedOperator({ id: OPERATOR_ID }));

    const issue = async (name: string): Promise<IssuedGatewayApiKey> => {
        const response = await ctx.app.inject({
            method: 'POST',
            url: '/tower/keys',
            headers: ADMIN,
            payload: { name, isActive: true }
        });

        expect(response.statusCode).toBe(201);
        return response.json<{ data: IssuedGatewayApiKey }>().data;
    };

    it('rejects a request without the admin key', async () => {
        const response = await ctx.app.inject({ method: 'GET', url: '/tower/keys' });

        expect(response.statusCode).toBe(401);
    });

    it('issues a key that authenticates a client', async () => {
        const issued = await issue('Web api');

        expect(issued.secret).toMatch(/^snt_/);
        expect(issued.key.preview.startsWith(issued.secret.slice(0, 8))).toBe(true);

        await expect(authenticateClient({ authorization: `Bearer ${issued.secret}` }, BEARER_AUTH))
            .resolves.toMatchObject({ id: issued.key.id });
    });

    it('rejects a key without a name', async () => {
        const response = await ctx.app.inject({
            method: 'POST',
            url: '/tower/keys',
            headers: ADMIN,
            payload: { name: '', isActive: true }
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchObject({ error: 'Request::ValidationFailed', errors: { name: 'Required' } });
        expect(await ApiKey.count()).toBe(0);
    });

    it('never returns the secret or its hash again', async () => {
        const issued = await issue('Web api');

        const response = await ctx.app.inject({ method: 'GET', url: '/tower/keys', headers: ADMIN });

        expect(response.body).not.toContain(issued.secret);
        expect(response.body).not.toContain('keyHash');
        expect(response.json<{ data: PublicGatewayApiKey[] }>().data).toHaveLength(1);
    });

    it('reports what each key carried', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat');
        await Usage.create({
            providerId: provider.id,
            apiKeyId: key.id,
            kind: 'chat',
            model: 'm1',
            inputTokens: 10,
            cachedTokens: 0,
            outputTokens: 5,
            costUsd: 0,
            latencyMs: 100,
            status: 200
        }).save();

        const response = await ctx.app.inject({ method: 'GET', url: '/tower/keys', headers: ADMIN });
        const [listed] = response.json<{ data: PublicGatewayApiKey[] }>().data;

        expect(listed).toMatchObject({ id: key.id, requests: 1 });
        expect(listed?.lastUsedAt).not.toBeNull();
    });

    it('stops authenticating once the key is deactivated', async () => {
        const issued = await issue('Web api');

        const response = await ctx.app.inject({
            method: 'PATCH',
            url: `/tower/keys/${issued.key.id}`,
            headers: ADMIN,
            payload: { isActive: false }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json<{ data: PublicGatewayApiKey }>().data.isActive).toBe(false);

        await expect(authenticateClient({ authorization: `Bearer ${issued.secret}` }, BEARER_AUTH))
            .rejects.toThrow('ApiKey::Unauthorized');
    });

    it('revokes a key for good', async () => {
        const issued = await issue('Web api');

        const response = await ctx.app.inject({
            method: 'DELETE',
            url: `/tower/keys/${issued.key.id}`,
            headers: ADMIN
        });

        expect(response.statusCode).toBe(204);
        expect(await ApiKey.countBy({ id: issued.key.id })).toBe(0);
    });

    it('answers 404 for a key that does not exist', async () => {
        const response = await ctx.app.inject({ method: 'DELETE', url: `/tower/keys/${uuid(1)}`, headers: ADMIN });

        expect(response.statusCode).toBe(404);
        expect(response.json<{ error: string }>().error).toContain('ApiKey::NotFound');
    });
});
