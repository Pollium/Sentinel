import ProviderHealth from '@/modules/providers/services/pool/ProviderHealth';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('ProviderHealth', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('cools a provider down after three consecutive failures', () => {
        const health = new ProviderHealth();

        for(let i = 0; i < 3; i++) health.recordFailure('1');

        expect(health.isAvailable('1')).toBe(false);
    });

    it('makes the provider available again once the cooldown elapses', () => {
        vi.useFakeTimers();
        const health = new ProviderHealth();

        for(let i = 0; i < 3; i++) health.recordFailure('1');
        expect(health.isAvailable('1')).toBe(false);

        vi.advanceTimersByTime(30_000);

        expect(health.isAvailable('1')).toBe(true);
    });

    it('resets the failure count on success', () => {
        const health = new ProviderHealth();

        health.recordFailure('1');
        health.recordFailure('1');
        health.recordSuccess('1');
        health.recordFailure('1');
        health.recordFailure('1');

        expect(health.isAvailable('1')).toBe(true);
    });

    it('rests a provider out of credits for ten minutes at once and says why', () => {
        vi.useFakeTimers();
        const health = new ProviderHealth();

        health.recordOutOfCredits('1');

        expect(health.isAvailable('1')).toBe(false);
        expect(health.stateOf('1')).toMatchObject({ consecutiveFailures: 0, isOutOfCredits: true });
        vi.advanceTimersByTime(9 * 60_000);
        expect(health.isAvailable('1')).toBe(false);
        vi.advanceTimersByTime(60_000);
        expect(health.isAvailable('1')).toBe(true);
        expect(health.stateOf('1')).toEqual({ consecutiveFailures: 0, cooldownUntil: null, isOutOfCredits: false });
    });

    it('does not call a provider cooling down after failures out of credits', () => {
        const health = new ProviderHealth();

        for(let i = 0; i < 3; i++) health.recordFailure('1');

        expect(health.stateOf('1').isOutOfCredits).toBe(false);
    });
});
