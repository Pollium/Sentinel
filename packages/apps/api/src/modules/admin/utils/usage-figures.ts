import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { UsageRange, UsageScope } from '../contracts/domain/usage';

export interface FiguresRow{
    requests: string;
    errors: string;
    inputTokens: string | null;
    cachedTokens: string | null;
    outputTokens: string | null;
    costUsd: string | null;
    unpricedRequests: string;
    medianMs: string | null;
}

interface Figures{
    requests: number;
    errors: number;
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
    costUsd: number;
    unpricedRequests: number;
    medianLatencyMs: number;
}

const UNPRICED = 'COUNT(*) FILTER (WHERE row.kind = \'chat\' AND row.status < 400 AND row."costUsd" = 0 AND row."inputTokens" + row."outputTokens" > 0)';

const MEDIAN_LATENCY = 'percentile_cont(0.5) WITHIN GROUP (ORDER BY row."latencyMs")';
export const SLOWEST_LATENCY = 'percentile_cont(0.95) WITHIN GROUP (ORDER BY row."latencyMs")';

export const scoped = <T extends ObjectLiteral>(query: SelectQueryBuilder<T>, range: UsageRange, scope: UsageScope | null): SelectQueryBuilder<T> => {
    if(range.since !== null) query.andWhere('row."createdAt" >= :since', { since: range.since.toISOString() });
    if(range.until !== null) query.andWhere('row."createdAt" < :until', { until: range.until.toISOString() });
    if(scope !== null) query.andWhere(`row."${scope.field}" = :scoped`, { scoped: scope.value });
    return query;
};

export const withFigures = <T extends ObjectLiteral>(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> => query
    .select('COUNT(*)', 'requests')
    .addSelect('COUNT(*) FILTER (WHERE row.status >= 400)', 'errors')
    .addSelect('SUM(row."inputTokens")', 'inputTokens')
    .addSelect('SUM(row."cachedTokens")', 'cachedTokens')
    .addSelect('SUM(row."outputTokens")', 'outputTokens')
    .addSelect('SUM(row."costUsd")', 'costUsd')
    .addSelect(UNPRICED, 'unpricedRequests')
    .addSelect(MEDIAN_LATENCY, 'medianMs');

export const figuresOf = (row: FiguresRow | undefined): Figures => ({
    requests: Number(row?.requests ?? 0),
    errors: Number(row?.errors ?? 0),
    inputTokens: Number(row?.inputTokens ?? 0),
    cachedTokens: Number(row?.cachedTokens ?? 0),
    outputTokens: Number(row?.outputTokens ?? 0),
    costUsd: Number(row?.costUsd ?? 0),
    unpricedRequests: Number(row?.unpricedRequests ?? 0),
    medianLatencyMs: Math.round(Number(row?.medianMs ?? 0))
});
