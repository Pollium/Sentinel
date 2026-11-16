import Provider from '@/modules/providers/models/Provider';
import ProviderHealth from '@/modules/providers/services/pool/ProviderHealth';
import { pickProvider } from '@/modules/providers/services/pool/pick-provider';
import { afterEach, describe, expect, it, vi } from 'vitest';

const provider = (id: string): Provider => Object.assign(new Provider(), { id });

describe('pickProvider', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('spreads across every eligible provider', () => {
        const health = new ProviderHealth();
        const providers = [provider('1'), provider('2'), provider('3')];

        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(pickProvider(providers, health, new Set())).toBe(providers[0]);

        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        expect(pickProvider(providers, health, new Set())).toBe(providers[1]);

        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        expect(pickProvider(providers, health, new Set())).toBe(providers[2]);
    });

    it('rolls only across the providers still eligible', () => {
        const spent = provider('1');
        const remaining = provider('2');
        vi.spyOn(Math, 'random').mockReturnValue(0);

        expect(pickProvider([spent, remaining], new ProviderHealth(), new Set([spent.id]))).toBe(remaining);
    });

    it('skips providers that are cooling down', () => {
        const health = new ProviderHealth();

        const hot = provider('1');
        const cooling = provider('2');
        for(let i = 0; i < 3; i++) health.recordFailure(cooling.id);

        expect(pickProvider([cooling, hot], health, new Set())).toBe(hot);
    });

    it('returns null when every provider is cooling down', () => {
        const health = new ProviderHealth();

        const only = provider('1');
        for(let i = 0; i < 3; i++) health.recordFailure(only.id);

        expect(pickProvider([only], health, new Set())).toBeNull();
    });
});
