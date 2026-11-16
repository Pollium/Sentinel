import { GatewayKind } from '../providers/domain';

export enum UsageWindow{
    Week = '7d',
    Month = '30d',
    All = 'all'
}

export const USAGE_WINDOW_DAYS: Partial<Record<UsageWindow, number>> = {
    [UsageWindow.Week]: 7,
    [UsageWindow.Month]: 30
};

export const usageWindowOf = (raw: unknown): UsageWindow =>
    Object.values(UsageWindow).find((candidate) => candidate === raw) ?? UsageWindow.Month;

export type GatewayFailureCause = 'unreachable' | 'rejected' | 'out-of-credits' | 'unreadable';

export const LATENCY_SPAN_EDGES_MS = [1000, 2000, 5000, 10_000, 30_000];

export interface GatewayLatency{
    medianMs: number;
    slowestMs: number;
    spans: number[];
}

export interface GatewayTotals{
    requests: number;
    errors: number;
    failedAttempts: number;
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
    costUsd: number;
    unpricedRequests: number;
    latency: GatewayLatency;
}

export interface GatewayUsageDay{
    date: string;
    requests: number;
    errors: number;
    failedAttempts: number;
    tokens: number;
    costUsd: number;
    medianLatencyMs: number;
}

export interface GatewayLoadCell{
    isoWeekday: number;
    hour: number;
    requests: number;
}

export interface GatewayFailureCount{
    cause: GatewayFailureCause;
    status: number;
    attempts: number;
}

export interface GatewayShare{
    id: string;
    label: string;
    kind: GatewayKind | null;
    requests: number;
    errors: number;
    failedAttempts: number;
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
    costUsd: number;
    unpricedRequests: number;
    medianLatencyMs: number;
}

export interface GatewayUsageSlice{
    window: UsageWindow;
    totals: GatewayTotals;
    previous: GatewayTotals | null;
    days: GatewayUsageDay[];
    previousDays: GatewayUsageDay[];
    hours: GatewayLoadCell[];
    failures: GatewayFailureCount[];
    providers: GatewayShare[];
    models: GatewayShare[];
    keys: GatewayShare[];
    lastRequestAt: string | null;
}

export interface GatewayLiveMinute{
    at: string;
    requests: number;
    errors: number;
    failedAttempts: number;
    tokens: number;
    slowestMs: number;
    openRequests: number;
}

export interface GatewayLive{
    inFlight: number;
    minutes: GatewayLiveMinute[];
}

export interface GatewayOverview extends GatewayUsageSlice{
    live: GatewayLive;
}
