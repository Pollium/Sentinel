import { GatewayUsageSlice, UsageWindow } from '@sentinel/contracts/usage/domain';
import { useApp } from '@tests/harness';
import { seedApiKey, seedFailure, seedProvider, seedUsage } from '@tests/seed';
import { OPERATOR_ID, operatorHeaders, seedOperator } from '@tests/operators';
import { beforeEach, describe, expect, it } from 'vitest';

const ADMIN = operatorHeaders();
const DAYS_AGO_MS = 3 * 86_400_000;
const LONG_AGO_MS = 60 * 86_400_000;

describe('usage routes', () => {
    const ctx = useApp();
    beforeEach(() => seedOperator({ id: OPERATOR_ID }));

    const read = async (url: string): Promise<GatewayUsageSlice> => {
        const response = await ctx.app.inject({ method: 'GET', url, headers: ADMIN });

        expect(response.statusCode).toBe(200);
        return response.json<{ data: GatewayUsageSlice }>().data;
    };

    const seedTraffic = async () => {
        const api = await seedApiKey('snt_api', { name: 'api' });
        const studio = await seedApiKey('snt_studio', { name: 'studio' });
        const openrouter = await seedProvider('chat', { name: 'OpenRouter' });
        const anthropic = await seedProvider('chat', { name: 'Anthropic' });
        const lastAt = new Date(Date.now() - DAYS_AGO_MS);

        await seedUsage({ providerId: openrouter.id, apiKeyId: api.id, model: 'openai/gpt-5-mini', costUsd: 0.2, at: lastAt });
        await seedUsage({ providerId: openrouter.id, apiKeyId: studio.id, model: 'claude-sonnet-4-5', costUsd: 0.5 });
        await seedUsage({ providerId: anthropic.id, apiKeyId: api.id, model: 'claude-sonnet-4-5', costUsd: 0.7 });
        await seedFailure({ providerId: anthropic.id, apiKeyId: api.id, model: 'claude-sonnet-4-5', cause: 'rejected', status: 529 });
        await seedFailure({ providerId: openrouter.id, apiKeyId: studio.id, model: 'claude-sonnet-4-5', cause: 'out-of-credits', status: 402 });

        return { api, studio, openrouter, anthropic };
    };

    it('narrows the usage to one provider', async () => {
        const { anthropic, api } = await seedTraffic();

        const slice = await read(`/tower/providers/${anthropic.id}/usage?window=${UsageWindow.Week}`);

        expect(slice.window).toBe(UsageWindow.Week);
        expect(slice.totals).toMatchObject({ requests: 1, costUsd: 0.7, failedAttempts: 1 });
        expect(slice.failures).toEqual([{ cause: 'rejected', status: 529, attempts: 1 }]);
        expect(slice.providers.map((share) => share.id)).toEqual([anthropic.id]);
        expect(slice.keys.map((share) => share.id)).toEqual([api.id]);
        expect(slice.lastRequestAt).not.toBeNull();
    });

    it('narrows the usage to one model, even one whose id holds a slash', async () => {
        const { openrouter, api } = await seedTraffic();

        const slice = await read(`/tower/models/${encodeURIComponent('openai/gpt-5-mini')}/usage`);

        expect(slice.totals).toMatchObject({ requests: 1, costUsd: 0.2, failedAttempts: 0 });
        expect(slice.providers).toMatchObject([{ id: openrouter.id, label: 'OpenRouter' }]);
        expect(slice.keys).toMatchObject([{ id: api.id, label: 'api' }]);
    });

    it('narrows the usage to one key and dates its last request', async () => {
        const { studio, openrouter } = await seedTraffic();

        const slice = await read(`/tower/keys/${studio.id}/usage`);

        expect(slice.totals).toMatchObject({ requests: 1, costUsd: 0.5, failedAttempts: 1 });
        expect(slice.failures).toEqual([{ cause: 'out-of-credits', status: 402, attempts: 1 }]);
        expect(slice.models).toMatchObject([{ id: 'claude-sonnet-4-5', kind: 'chat', requests: 1, failedAttempts: 1 }]);
        expect(slice.providers).toMatchObject([{ id: openrouter.id, requests: 1, failedAttempts: 1 }]);
    });

    it('dates the last request even when it falls outside the window', async () => {
        const key = await seedApiKey('snt_old', { name: 'old' });
        const provider = await seedProvider('chat');
        const longAgo = new Date(Date.now() - LONG_AGO_MS);
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, at: longAgo });

        const slice = await read(`/tower/keys/${key.id}/usage?window=${UsageWindow.Week}`);

        expect(slice.totals.requests).toBe(0);
        expect(slice.lastRequestAt).toBe(longAgo.toISOString());
    });

    it('answers an empty slice for a provider nobody has called', async () => {
        const provider = await seedProvider('voice');

        const slice = await read(`/tower/providers/${provider.id}/usage`);

        expect(slice.totals.requests).toBe(0);
        expect(slice.providers).toEqual([]);
        expect(slice.lastRequestAt).toBeNull();
    });

    it('keeps the usage behind operator sign-in', async () => {
        const provider = await seedProvider('chat');

        const response = await ctx.app.inject({ method: 'GET', url: `/tower/providers/${provider.id}/usage` });

        expect(response.statusCode).toBe(401);
    });
});
