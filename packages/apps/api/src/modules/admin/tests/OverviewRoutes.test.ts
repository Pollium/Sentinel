import { GatewayOverview, LATENCY_SPAN_EDGES_MS, UsageWindow } from '@sentinel/contracts/usage/domain';
import { shiftDay, utcDay } from '@sentinel/contracts/shared/day';
import { inFlight } from '@/modules/providers/services/proxy/InFlight';
import { LIVE_MINUTES } from '@/modules/admin/services/LiveMinutes';
import { useApp } from '@tests/harness';
import { seedApiKey, seedFailure, seedProvider, seedUsage } from '@tests/seed';
import { OPERATOR_ID, operatorHeaders, seedOperator } from '@tests/operators';
import { describe, expect, it, beforeEach } from 'vitest';

const ADMIN = operatorHeaders();
const WEEK_CELLS = 168;
const WEEK_DAYS = 7;
const MONTH_DAYS = 30;
const WITHIN_WEEK_DAYS_AGO = 2;
const PREVIOUS_WEEK_DAYS_AGO = 10;
const WITHIN_MONTH_DAYS_AGO = 10;
const BEFORE_MONTH_DAYS_AGO = 60;
const EMPTY_TOTALS = {
    requests: 0,
    errors: 0,
    failedAttempts: 0,
    inputTokens: 0,
    cachedTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    unpricedRequests: 0,
    latency: { medianMs: 0, slowestMs: 0, spans: Array.from({ length: LATENCY_SPAN_EDGES_MS.length + 1 }, () => 0) }
};

const isoWeekdayOf = (at: Date): number => {
    const weekday = at.getUTCDay();
    return weekday === 0 ? 7 : weekday;
};

const weekdayHour = (isoWeekday: number, hour: number): Date => {
    const now = new Date();
    const daysBack = (isoWeekdayOf(now) - isoWeekday + 7) % 7;

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack, hour, 0, 0, 0));
};

const noonDaysAgo = (days: number): Date => {
    const now = new Date();

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days, 12, 0, 0, 0));
};

describe('overview route', () => {
    const ctx = useApp();
    beforeEach(() => seedOperator({ id: OPERATOR_ID }));

    const read = async (search = ''): Promise<GatewayOverview> => {
        const response = await ctx.app.inject({ method: 'GET', url: `/tower/overview${search}`, headers: ADMIN });

        expect(response.statusCode).toBe(200);
        return response.json<{ data: GatewayOverview }>().data;
    };

    it('answers with an empty window before any traffic', async () => {
        const overview = await read();

        expect(overview.totals).toEqual(EMPTY_TOTALS);
        expect(overview.previous).toEqual(EMPTY_TOTALS);
        expect(overview.window).toBe(UsageWindow.Month);
        expect(overview.days).toHaveLength(MONTH_DAYS);
        expect(overview.previousDays).toHaveLength(MONTH_DAYS);
        expect(overview.days.every((day) => day.costUsd === 0)).toBe(true);
        expect(overview.hours).toHaveLength(WEEK_CELLS);
        expect(overview.hours.every((cell) => cell.requests === 0)).toBe(true);
        expect(overview.live.inFlight).toBe(0);
        expect(overview.live.minutes).toHaveLength(LIVE_MINUTES);
        expect(overview.live.minutes.every((minute) => minute.requests === 0 && minute.openRequests === 0)).toBe(true);
        expect(overview.failures).toEqual([]);
        expect(overview.providers).toEqual([]);
        expect(overview.models).toEqual([]);
        expect(overview.keys).toEqual([]);
        expect(overview.lastRequestAt).toBeNull();
    });

    it('aggregates tokens, cost and latency across the window', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat', { name: 'OpenRouter' });

        await seedUsage({ providerId: provider.id, apiKeyId: key.id, inputTokens: 100, cachedTokens: 40, outputTokens: 50, costUsd: 0.25, latencyMs: 200 });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, inputTokens: 10, outputTokens: 0, costUsd: 0.75, latencyMs: 400, status: 500 });

        const overview = await read();

        expect(overview.totals).toMatchObject({
            requests: 2,
            errors: 1,
            inputTokens: 110,
            cachedTokens: 40,
            outputTokens: 50,
            costUsd: 1,
            latency: { medianMs: 300, slowestMs: 390 }
        });
        expect(overview.days.at(-1)).toMatchObject({ requests: 2, errors: 1, tokens: 160, costUsd: 1, medianLatencyMs: 300 });

        const now = new Date();

        expect(overview.hours.find((cell) =>
            cell.isoWeekday === isoWeekdayOf(now) && cell.hour === now.getUTCHours()
        )).toMatchObject({ requests: 2 });
    });

    it('sorts latency into spans and keeps the slowest out of the median', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat');

        await seedUsage({ providerId: provider.id, apiKeyId: key.id, latencyMs: 500 });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, latencyMs: 1500 });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, latencyMs: 45_000 });

        const { latency } = (await read()).totals;

        expect(latency.spans).toEqual([1, 1, 0, 0, 0, 1]);
        expect(latency.medianMs).toBe(1500);
    });

    it('counts a chat answer that cost nothing as unpriced, but not a failed or a silent one', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat');

        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0 });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0, status: 400 });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0, inputTokens: 0, outputTokens: 0 });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.1 });

        expect((await read()).totals.unpricedRequests).toBe(1);
    });

    it('narrows every aggregate to the requested window', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat');
        const withinMonth = noonDaysAgo(WITHIN_MONTH_DAYS_AGO);
        const beforeMonth = noonDaysAgo(BEFORE_MONTH_DAYS_AGO);

        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.25, at: withinMonth });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.75, at: beforeMonth });

        const week = await read(`?window=${UsageWindow.Week}`);
        const month = await read(`?window=${UsageWindow.Month}`);
        const all = await read(`?window=${UsageWindow.All}`);

        expect(week.window).toBe(UsageWindow.Week);
        expect(week.days).toHaveLength(WEEK_DAYS);
        expect(week.totals.requests).toBe(0);
        expect(week.keys).toEqual([]);

        expect(month.totals).toMatchObject({ requests: 1, costUsd: 0.25 });
        expect(month.models).toMatchObject([{ id: 'gpt-5-mini', requests: 1 }]);
        expect(month.days.find((day) => day.date === utcDay(withinMonth))).toMatchObject({ requests: 1 });

        expect(all.window).toBe(UsageWindow.All);
        expect(all.totals).toMatchObject({ requests: 2, costUsd: 1 });
        expect(all.previous).toBeNull();
        expect(all.previousDays).toEqual([]);
        expect(all.keys).toMatchObject([{ id: key.id, requests: 2, costUsd: 1 }]);
        expect(all.days).toHaveLength(BEFORE_MONTH_DAYS_AGO + 1);
        expect(all.days[0]).toMatchObject({ date: utcDay(beforeMonth), requests: 1, costUsd: 0.75 });
        expect(all.days.at(-1)?.date).toBe(utcDay());
        expect(all.hours.reduce((sum, cell) => sum + cell.requests, 0)).toBe(2);
    });

    it('sets the window beside the same span just before it', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat');
        const lastWeek = noonDaysAgo(PREVIOUS_WEEK_DAYS_AGO);

        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.5, at: noonDaysAgo(WITHIN_WEEK_DAYS_AGO) });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.25, at: lastWeek });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.25, at: lastWeek });

        const week = await read(`?window=${UsageWindow.Week}`);

        expect(week.totals).toMatchObject({ requests: 1, costUsd: 0.5 });
        expect(week.previous).toMatchObject({ requests: 2, costUsd: 0.5 });
        expect(week.previousDays).toHaveLength(WEEK_DAYS);
        expect(week.previousDays.find((day) => day.date === utcDay(lastWeek))).toMatchObject({ requests: 2 });
        expect(week.previousDays.at(-1)?.date).toBe(shiftDay(week.days[0].date, -1));
    });

    it('starts the all-time series today before any traffic', async () => {
        const overview = await read(`?window=${UsageWindow.All}`);

        expect(overview.days).toEqual([{ date: utcDay(), requests: 0, errors: 0, failedAttempts: 0, tokens: 0, costUsd: 0, medianLatencyMs: 0 }]);
    });

    it('falls back to thirty days for a window it does not know', async () => {
        const overview = await read('?window=forever');

        expect(overview.window).toBe(UsageWindow.Month);
        expect(overview.days).toHaveLength(MONTH_DAYS);
    });

    it('bins cost by day and load by weekday hour', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat');
        const mondayNine = weekdayHour(1, 9);
        const tuesdayFourteen = weekdayHour(2, 14);

        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.25, at: mondayNine });
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, costUsd: 0.75, at: tuesdayFourteen });

        const overview = await read();
        const mondayCell = overview.hours.find((cell) => cell.isoWeekday === 1 && cell.hour === 9);
        const tuesdayCell = overview.hours.find((cell) => cell.isoWeekday === 2 && cell.hour === 14);
        const mondayDay = overview.days.find((day) => day.date === mondayNine.toISOString().slice(0, 10));
        const tuesdayDay = overview.days.find((day) => day.date === tuesdayFourteen.toISOString().slice(0, 10));

        expect(mondayCell).toMatchObject({ requests: 1 });
        expect(tuesdayCell).toMatchObject({ requests: 1 });
        expect(mondayDay).toMatchObject({ requests: 1, costUsd: 0.25 });
        expect(tuesdayDay).toMatchObject({ requests: 1, costUsd: 0.75 });
    });

    it('counts the last thirty minutes minute by minute', async () => {
        const key = await seedApiKey();
        const provider = await seedProvider('chat');

        await Promise.all(Array.from({ length: 5 }, () => seedUsage({
            providerId: provider.id,
            apiKeyId: key.id,
            inputTokens: 60,
            outputTokens: 0,
            latencyMs: 6000
        })));
        await seedUsage({ providerId: provider.id, apiKeyId: key.id, status: 500, latencyMs: 100 });
        await seedFailure({ providerId: provider.id, apiKeyId: key.id });

        const { live } = await read();
        const total = (field: 'requests' | 'errors' | 'failedAttempts' | 'tokens' | 'openRequests') =>
            live.minutes.reduce((sum, minute) => sum + minute[field], 0);

        expect(live.minutes).toHaveLength(LIVE_MINUTES);
        expect(Date.parse(live.minutes.at(-1)?.at ?? '')).toBeLessThanOrEqual(Date.now());
        expect([total('requests'), total('errors'), total('failedAttempts'), total('tokens')]).toEqual([6, 1, 1, 314]);
        expect(total('openRequests')).toBeCloseTo((5 * 6 + 0.1) / 60, 3);
    });

    it('breaks usage down by provider, model and key, with each one\'s failed attempts', async () => {
        const web = await seedApiKey('snt_web', { name: 'web-api' });
        const ops = await seedApiKey('snt_ops', { name: 'ops-script' });
        const openrouter = await seedProvider('chat', { name: 'OpenRouter' });
        const bedrock = await seedProvider('chat', { name: 'Bedrock' });

        await seedUsage({ providerId: bedrock.id, apiKeyId: web.id, model: 'zai.glm-5', inputTokens: 100, outputTokens: 40, costUsd: 0.8, latencyMs: 200 });
        await seedUsage({ providerId: openrouter.id, apiKeyId: web.id, inputTokens: 20, outputTokens: 10, costUsd: 0.25 });
        await seedUsage({ providerId: openrouter.id, apiKeyId: ops.id, inputTokens: 10, outputTokens: 0, costUsd: 0.05, latencyMs: 80 });
        await seedFailure({ providerId: bedrock.id, apiKeyId: ops.id, model: 'zai.glm-5', cause: 'rejected', status: 529 });
        await seedFailure({ providerId: bedrock.id, apiKeyId: ops.id, model: 'zai.glm-5', cause: 'rejected', status: 529 });
        await seedFailure({ providerId: openrouter.id, apiKeyId: web.id, cause: 'unreachable', status: 0 });

        const overview = await read();

        expect(overview.providers.map((share) => [share.label, share.kind, share.requests, share.failedAttempts])).toEqual([
            ['OpenRouter', 'chat', 2, 1],
            ['Bedrock', 'chat', 1, 2]
        ]);
        expect(overview.models[0]).toMatchObject({ id: 'gpt-5-mini', label: 'gpt-5-mini', requests: 2, inputTokens: 30, outputTokens: 10, failedAttempts: 1 });
        expect(overview.models[0]?.costUsd).toBeCloseTo(0.3);
        expect(overview.models[1]).toMatchObject({ id: 'zai.glm-5', requests: 1, costUsd: 0.8, failedAttempts: 2, medianLatencyMs: 200 });
        expect(overview.keys).toMatchObject([
            { id: web.id, label: 'web-api', kind: null, requests: 2, inputTokens: 120, outputTokens: 50, costUsd: 1.05, failedAttempts: 1 },
            { id: ops.id, label: 'ops-script', requests: 1, inputTokens: 10, outputTokens: 0, costUsd: 0.05, failedAttempts: 2 }
        ]);
        expect(overview.totals.failedAttempts).toBe(3);
        expect(overview.failures).toEqual([
            { cause: 'rejected', status: 529, attempts: 2 },
            { cause: 'unreachable', status: 0, attempts: 1 }
        ]);
    });

    it('reports the requests the gateway is carrying right now', async () => {
        inFlight.count = 2;

        expect((await read()).live.inFlight).toBe(2);

        inFlight.count = 1;

        expect((await read()).live.inFlight).toBe(1);
    });
});
