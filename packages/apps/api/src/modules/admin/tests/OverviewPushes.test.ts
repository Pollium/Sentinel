import OverviewPushes, { LIVE_REFRESH_MS, OVERVIEW_PUSH_INTERVAL_MS } from '../services/OverviewPushes';
import { logger } from '@pollium/readable/app/logger';
import { GatewayOverview, GatewayTotals, UsageWindow } from '@sentinel/contracts/usage/domain';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ZERO_TOTALS: GatewayTotals = {
    requests: 0,
    errors: 0,
    failedAttempts: 0,
    inputTokens: 0,
    cachedTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    unpricedRequests: 0,
    latency: { medianMs: 0, slowestMs: 0, spans: [] }
};

const overviewOf = (requests: number[], inFlight: number): GatewayOverview => ({
    window: UsageWindow.Week,
    totals: ZERO_TOTALS,
    previous: ZERO_TOTALS,
    days: [],
    previousDays: [],
    hours: [],
    failures: [],
    providers: [],
    models: [],
    keys: [],
    lastRequestAt: null,
    live: {
        inFlight,
        minutes: requests.map((count, index) => ({
            at: new Date(index * 60_000).toISOString(),
            requests: count,
            errors: 0,
            failedAttempts: 0,
            tokens: 0,
            slowestMs: 0,
            openRequests: 0
        }))
    }
});

const QUIET = overviewOf([0, 0], 0);
const RECENT = overviewOf([0, 1], 0);
const OPEN = overviewOf([0, 0], 1);

const pushing = (answers: Array<GatewayOverview | null>) => {
    const pushed: UsageWindow[] = [];
    const pushes = new OverviewPushes(async (window) => {
        pushed.push(window);
        const answer = answers.shift();
        return answer === undefined ? QUIET : answer;
    });

    return {
        pushed,
        pushes
    };
};

describe('OverviewPushes', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('folds a burst of usage into one push, an interval later', async () => {
        const { pushed, pushes } = pushing([]);

        pushes.changed(UsageWindow.Week);
        pushes.changed(UsageWindow.Week);
        pushes.changed(UsageWindow.Week);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS - 1);
        expect(pushed).toEqual([]);

        await vi.advanceTimersByTimeAsync(1);
        expect(pushed).toEqual([UsageWindow.Week]);

        await vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS * 2);
        expect(pushed).toEqual([UsageWindow.Week]);
    });

    it('paces each window on its own', async () => {
        const { pushed, pushes } = pushing([]);

        pushes.changed(UsageWindow.Week);
        pushes.changed(UsageWindow.All);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS);

        expect(pushed).toEqual([UsageWindow.Week, UsageWindow.All]);
    });

    it('never runs a window twice at once, and pushes again for usage that landed meanwhile', async () => {
        const releases: Array<(overview: GatewayOverview) => void> = [];
        const pushes = new OverviewPushes(() => new Promise((resolve) => releases.push(resolve)));

        pushes.changed(UsageWindow.All);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS);
        pushes.changed(UsageWindow.All);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS * 3);
        expect(releases).toHaveLength(1);

        releases[0]?.(QUIET);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS);

        expect(releases).toHaveLength(2);
    });

    it('refreshes a window every minute while its live tiles hold traffic, and stops once they are quiet', async () => {
        const { pushed, pushes } = pushing([RECENT, OPEN, QUIET]);

        pushes.changed(UsageWindow.Week);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS);
        await vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS);
        await vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS);
        expect(pushed).toHaveLength(3);

        await vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS * 5);
        expect(pushed).toHaveLength(3);
    });

    it('refreshes an overview a socket was just shown only if it holds traffic', async () => {
        const { pushed, pushes } = pushing([]);

        pushes.shown(UsageWindow.Week, QUIET);
        pushes.shown(UsageWindow.Month, RECENT);
        await vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS - 1);
        expect(pushed).toEqual([]);

        await vi.advanceTimersByTimeAsync(1);
        expect(pushed).toEqual([UsageWindow.Month]);
    });

    it('lets new usage cut a pending refresh short', async () => {
        const { pushed, pushes } = pushing([]);

        pushes.shown(UsageWindow.Week, RECENT);
        pushes.changed(UsageWindow.Week);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS);
        expect(pushed).toEqual([UsageWindow.Week]);

        await vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS);
        expect(pushed).toEqual([UsageWindow.Week]);
    });

    it('stops refreshing a window nobody watches any more', async () => {
        const { pushed, pushes } = pushing([null]);

        pushes.shown(UsageWindow.Week, RECENT);
        await vi.advanceTimersByTimeAsync(LIVE_REFRESH_MS * 4);

        expect(pushed).toEqual([UsageWindow.Week]);
    });

    it('logs a failed push and keeps pushing the window', async () => {
        const logged = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
        const failure = new Error('database went away');
        let calls = 0;
        const pushes = new OverviewPushes(async () => {
            calls += 1;
            if(calls === 1) throw failure;
            return QUIET;
        });

        pushes.changed(UsageWindow.Week);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS);
        pushes.changed(UsageWindow.Week);
        await vi.advanceTimersByTimeAsync(OVERVIEW_PUSH_INTERVAL_MS);

        expect(calls).toBe(2);
        expect(logged).toHaveBeenCalledWith('tower overview push failed', failure, { scope: 'tower', window: UsageWindow.Week });
    });
});
