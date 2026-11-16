import UsageRecorder from '@/modules/providers/services/pool/UsageRecorder';
import { useApp } from '@tests/harness';
import { pricedModel, seedApiKey, seedProvider } from '@tests/seed';
import { describe, expect, it } from 'vitest';

const recorder = new UsageRecorder();

describe('UsageRecorder', () => {
    useApp();

    it('prices the request with the model the provider serves', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat', {
            models: [pricedModel('m1', { inputPricePerMillion: 10, outputPricePerMillion: 30 })]
        });

        const usage = await recorder.write({
            provider,
            apiKeyId: key.id,
            kind: 'chat',
            model: 'm1',
            inputTokens: 1_000_000,
            cachedTokens: 0,
            outputTokens: 1_000_000,
            latencyMs: 100,
            status: 200
        });

        expect(usage.costUsd).toBe(40);
    });

    it('charges cached tokens at the cached rate', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat', {
            models: [pricedModel('m1', { inputPricePerMillion: 10, cachedInputPricePerMillion: 1 })]
        });

        const usage = await recorder.write({
            provider,
            apiKeyId: key.id,
            kind: 'chat',
            model: 'm1',
            inputTokens: 1_000_000,
            cachedTokens: 500_000,
            outputTokens: 0,
            latencyMs: 100,
            status: 200
        });

        expect(usage.costUsd).toBe(5.5);
    });

    it('costs nothing when the model carries no prices', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('voice');

        const usage = await recorder.write({
            provider,
            apiKeyId: key.id,
            kind: 'voice',
            model: 'aura-2',
            inputTokens: 0,
            cachedTokens: 0,
            outputTokens: 0,
            latencyMs: 100,
            status: 200
        });

        expect(usage.costUsd).toBe(0);
        expect(usage.apiKeyId).toBe(key.id);
    });
});
