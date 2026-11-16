import { ChartPoint, HeadlineMetric } from '@sentinel/ui/contracts/chart';
import { GatewayLive, GatewayLiveMinute, GatewayOverview, GatewayTotals, GatewayUsageDay } from '@sentinel/contracts/usage/domain';
import { compact, count, rate, usd } from '@sentinel/ui/utils/format/format-metrics';
import { tenths } from '@sentinel/ui/utils/format/tenths';
import { deltaLabel, deltaOf, sum } from '@sentinel/ui/utils/metrics/period';
import { seconds } from '@/modules/tower/utils/latency';
import { daysOf } from '@/modules/tower/utils/windows';

const PERCENT = 100;
const SECONDS_PER_MINUTE = 60;
const RECENT_MINUTES = 5;
const FLAT_POINTS = 0.05;
const TENTHS = 10;

interface PeriodTile{
    key: string;
    label: string;
    value: (totals: GatewayTotals) => number;
    perDay: (day: GatewayUsageDay) => number;
    format: (value: number) => string;
    delta?: (current: number, previous: number) => string;
}

const share = (part: number, whole: number): number => whole === 0 ? 0 : (part / whole) * PERCENT;

const shareFormat = (value: number): string => `${value.toFixed(1)}%`;

const pointsDelta = (current: number, previous: number): string => {
    const change = current - previous;
    if(Math.abs(change) < FLAT_POINTS) return 'flat';
    return `${change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)} pts`;
};

const PERIOD_TILES: PeriodTile[] = [
    { key: 'requests', label: 'Requests', value: (totals) => totals.requests, perDay: (day) => day.requests, format: count },
    { key: 'spend', label: 'Spend', value: (totals) => totals.costUsd, perDay: (day) => day.costUsd, format: usd },
    { key: 'tokens', label: 'Tokens', value: (totals) => totals.inputTokens + totals.outputTokens, perDay: (day) => day.tokens, format: compact },
    {
        key: 'failed',
        label: 'Failed',
        value: (totals) => share(totals.errors, totals.requests),
        perDay: (day) => share(day.errors, day.requests),
        format: shareFormat,
        delta: pointsDelta
    },
    { key: 'latency', label: 'Median latency', value: (totals) => totals.latency.medianMs, perDay: (day) => day.medianLatencyMs, format: seconds }
];

const pointsOf = (days: GatewayUsageDay[], perDay: (day: GatewayUsageDay) => number): ChartPoint[] =>
    days.map((day) => ({ date: day.date, value: perDay(day) }));

export const periodTiles = (overview: GatewayOverview): HeadlineMetric[] => PERIOD_TILES.map((tile) => {
    const current = tile.value(overview.totals);
    const previous = overview.previous === null ? null : tile.value(overview.previous);

    return {
        key: tile.key,
        label: tile.label,
        value: tile.format(current),
        delta: previous === null ? '' : tile.delta?.(current, previous) ?? deltaLabel(deltaOf(current, previous)),
        days: daysOf(overview.window) ?? 0,
        current: pointsOf(overview.days, tile.perDay),
        previous: pointsOf(overview.previousDays, tile.perDay),
        format: tile.format
    };
});

const clock = (iso: string): string => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const liveTile = (key: string, label: string, value: string, delta: string, minutes: GatewayLiveMinute[], perMinute: (minute: GatewayLiveMinute) => number, format: (value: number) => string): HeadlineMetric => ({
    key,
    label,
    value,
    delta,
    days: 0,
    current: minutes.map((minute) => ({ date: clock(minute.at), value: perMinute(minute) })),
    previous: [],
    format
});

export const liveTiles = (live: GatewayLive): HeadlineMetric[] => {
    const { minutes } = live;
    const recent = minutes.slice(-RECENT_MINUTES - 1, -1);
    const requests = sum(recent.map((minute) => minute.requests));
    const failed = sum(recent.map((minute) => minute.failedAttempts));
    const latest = minutes.findLast((minute) => minute.requests > 0);
    const tenthsOf = (value: number): string => value.toFixed(1);

    return [
        liveTile('rpm', 'Requests / min', rate(Math.round((requests / RECENT_MINUTES) * TENTHS) / TENTHS), 'last 5 min', minutes, (minute) => minute.requests, count),
        liveTile('tps', 'Tokens / sec', count(Math.round(sum(recent.map((minute) => minute.tokens)) / (RECENT_MINUTES * SECONDS_PER_MINUTE))), 'last 5 min', minutes, (minute) => minute.tokens / SECONDS_PER_MINUTE, (value) => count(Math.round(value))),
        liveTile('flight', 'In flight', count(live.inFlight), 'open now', minutes, (minute) => minute.openRequests, tenthsOf),
        liveTile('failing', 'Failing now', tenths(failed, requests + failed), 'of attempts, last 5 min', minutes, (minute) => share(minute.failedAttempts, minute.requests + minute.failedAttempts), shareFormat),
        liveTile('slowest', 'Slowest 5%', latest === undefined ? '—' : seconds(latest.slowestMs), 'latest minute', minutes, (minute) => minute.slowestMs, seconds)
    ];
};
