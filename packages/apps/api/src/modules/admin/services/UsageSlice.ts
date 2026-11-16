import ApiKey from '@/modules/keys/models/ApiKey';
import Failure from '@/modules/providers/models/Failure';
import Provider from '@/modules/providers/models/Provider';
import Usage from '@/modules/providers/models/Usage';
import { GatewayFailureCause, GatewayFailureCount, GatewayLoadCell, GatewayShare, GatewayTotals, GatewayUsageDay, GatewayUsageSlice, LATENCY_SPAN_EDGES_MS, UsageWindow } from '@sentinel/contracts/usage/domain';
import { shiftDay, utcDay } from '@sentinel/contracts/shared/day';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { UsageRange, UsageScope, UsageScopeField } from '../contracts/domain/usage';
import { figuresOf, FiguresRow, scoped, SLOWEST_LATENCY, withFigures } from '../utils/usage-figures';
import { previousRangeOf, rangeOf } from '../utils/usage-range';

const WEEKDAYS = 7;
const HOURS_PER_DAY = 24;
const DAY = 'to_char(row."createdAt"::date, \'YYYY-MM-DD\')';
const DAY_GROUP = 'row."createdAt"::date';
const ISO_WEEKDAY = 'EXTRACT(ISODOW FROM row."createdAt" AT TIME ZONE \'UTC\')';
const HOUR = 'EXTRACT(HOUR FROM row."createdAt" AT TIME ZONE \'UTC\')';
const SPAN = `width_bucket(row."latencyMs", ARRAY[${LATENCY_SPAN_EDGES_MS.join(', ')}])`;
const EVERYTHING: UsageRange = { since: null, until: null };
const KIND = 'MIN(row.kind)';
const LAST_REQUEST = 'to_char(MAX(row."createdAt"), \'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"\')';

interface TotalsRow extends FiguresRow{
    slowestMs: string | null;
}

interface SpanRow{
    span: string;
    requests: string;
}

interface DayRow extends FiguresRow{
    date: string;
}

interface DayFailuresRow{
    date: string;
    attempts: string;
}

interface HourRow{
    isoWeekday: string;
    hour: string;
    requests: string;
}

interface FailureRow{
    cause: GatewayFailureCause;
    status: string;
    attempts: string;
}

interface ShareRow extends FiguresRow{
    id: string;
    kind: GatewayKind;
}

interface ShareFailuresRow{
    id: string;
    kind: GatewayKind;
    attempts: string;
}

interface LastRow{
    at: string | null;
}

const usage = (range: UsageRange, scope: UsageScope | null) => scoped(Usage.createQueryBuilder('row'), range, scope);
const failures = (range: UsageRange, scope: UsageScope | null) => scoped(Failure.createQueryBuilder('row'), range, scope);

const namesOf = async (field: UsageScopeField): Promise<Map<string, string> | null> => {
    if(field === 'providerId') return new Map((await Provider.find()).map((provider) => [provider.id, provider.name]));
    if(field === 'apiKeyId') return new Map((await ApiKey.find()).map((key) => [key.id, key.name]));
    return null;
};

export default class UsageSliceService{
    async read(window: UsageWindow, scope: UsageScope | null): Promise<GatewayUsageSlice>{
        const range = rangeOf(window);
        const before = previousRangeOf(window);

        const [totals, previous, days, previousDays, hours, failureCounts, providers, models, keys, lastRequestAt] = await Promise.all([
            UsageSliceService.#totals(range, scope),
            before === null ? null : UsageSliceService.#totals(before, scope),
            UsageSliceService.#days(range, scope),
            before === null ? [] : UsageSliceService.#days(before, scope),
            UsageSliceService.#hours(range, scope),
            UsageSliceService.#failures(range, scope),
            UsageSliceService.#shares(range, scope, 'providerId'),
            UsageSliceService.#shares(range, scope, 'model'),
            UsageSliceService.#shares(range, scope, 'apiKeyId'),
            UsageSliceService.#lastRequestAt(scope)
        ]);

        return {
            window,
            totals,
            previous,
            days,
            previousDays,
            hours,
            failures: failureCounts,
            providers,
            models,
            keys,
            lastRequestAt
        };
    }

    static async #totals(range: UsageRange, scope: UsageScope | null): Promise<GatewayTotals>{
        const [row, spans, failedAttempts] = await Promise.all([
            withFigures(usage(range, scope)).addSelect(SLOWEST_LATENCY, 'slowestMs').getRawOne<TotalsRow>(),
            usage(range, scope).select(SPAN, 'span').addSelect('COUNT(*)', 'requests').groupBy(SPAN).getRawMany<SpanRow>(),
            failures(range, scope).getCount()
        ]);
        const figures = figuresOf(row);
        const counted = new Map(spans.map((span) => [Number(span.span), Number(span.requests)]));

        return {
            requests: figures.requests,
            errors: figures.errors,
            failedAttempts,
            inputTokens: figures.inputTokens,
            cachedTokens: figures.cachedTokens,
            outputTokens: figures.outputTokens,
            costUsd: figures.costUsd,
            unpricedRequests: figures.unpricedRequests,
            latency: {
                medianMs: figures.medianLatencyMs,
                slowestMs: Math.round(Number(row?.slowestMs ?? 0)),
                spans: Array.from({ length: LATENCY_SPAN_EDGES_MS.length + 1 }, (_, span) => counted.get(span) ?? 0)
            }
        };
    }

    static async #days(range: UsageRange, scope: UsageScope | null): Promise<GatewayUsageDay[]>{
        const [rows, failed] = await Promise.all([
            withFigures(usage(range, scope)).addSelect(DAY, 'date').groupBy(DAY_GROUP).orderBy(DAY_GROUP, 'ASC').getRawMany<DayRow>(),
            failures(range, scope).select(DAY, 'date').addSelect('COUNT(*)', 'attempts').groupBy(DAY_GROUP).getRawMany<DayFailuresRow>()
        ]);

        const counted = new Map(rows.map((row) => [row.date, figuresOf(row)]));
        const attempts = new Map(failed.map((row) => [row.date, Number(row.attempts)]));
        const today = utcDay();
        const first = range.since === null ? [...counted.keys(), ...attempts.keys()].sort().at(0) ?? today : utcDay(range.since);
        const last = range.until === null ? today : shiftDay(utcDay(range.until), -1);
        const series: GatewayUsageDay[] = [];

        for(let date = first; date <= last; date = shiftDay(date, 1)){
            const figures = counted.get(date) ?? figuresOf(undefined);

            series.push({
                date,
                requests: figures.requests,
                errors: figures.errors,
                failedAttempts: attempts.get(date) ?? 0,
                tokens: figures.inputTokens + figures.outputTokens,
                costUsd: figures.costUsd,
                medianLatencyMs: figures.medianLatencyMs
            });
        }

        return series;
    }

    static async #hours(range: UsageRange, scope: UsageScope | null): Promise<GatewayLoadCell[]>{
        const rows = await usage(range, scope)
            .select(ISO_WEEKDAY, 'isoWeekday')
            .addSelect(HOUR, 'hour')
            .addSelect('COUNT(*)', 'requests')
            .groupBy(ISO_WEEKDAY)
            .addGroupBy(HOUR)
            .getRawMany<HourRow>();

        const counted = new Map(rows.map((row) => [`${Number(row.isoWeekday)}-${Number(row.hour)}`, Number(row.requests)]));

        return Array.from({ length: WEEKDAYS }, (_, day) => Array.from({ length: HOURS_PER_DAY }, (_, hour) => ({
            isoWeekday: day + 1,
            hour,
            requests: counted.get(`${day + 1}-${hour}`) ?? 0
        }))).flat();
    }

    static async #failures(range: UsageRange, scope: UsageScope | null): Promise<GatewayFailureCount[]>{
        const rows = await failures(range, scope)
            .select('row.cause', 'cause')
            .addSelect('row.status', 'status')
            .addSelect('COUNT(*)', 'attempts')
            .groupBy('row.cause')
            .addGroupBy('row.status')
            .orderBy('COUNT(*)', 'DESC')
            .getRawMany<FailureRow>();

        return rows.map((row) => ({ cause: row.cause, status: Number(row.status), attempts: Number(row.attempts) }));
    }

    static async #shares(range: UsageRange, scope: UsageScope | null, field: UsageScopeField): Promise<GatewayShare[]>{
        const column = `row."${field}"`;
        const [rows, failed, names] = await Promise.all([
            withFigures(usage(range, scope)).addSelect(column, 'id').addSelect(KIND, 'kind').andWhere(`${column} IS NOT NULL`).groupBy(column).getRawMany<ShareRow>(),
            failures(range, scope).select(column, 'id').addSelect(KIND, 'kind').addSelect('COUNT(*)', 'attempts').groupBy(column).getRawMany<ShareFailuresRow>(),
            namesOf(field)
        ]);

        const served = new Map(rows.map((row) => [row.id, figuresOf(row)]));
        const attempts = new Map(failed.map((row) => [row.id, Number(row.attempts)]));
        const kinds = new Map([...failed, ...rows].map((row) => [row.id, row.kind]));
        const ids = new Set([...served.keys(), ...attempts.keys()]);

        return [...ids]
            .map((id) => ({
                id,
                label: names === null ? id : names.get(id) ?? `#${id}`,
                kind: field === 'apiKeyId' ? null : kinds.get(id) ?? null,
                failedAttempts: attempts.get(id) ?? 0,
                ...figuresOf(undefined),
                ...served.get(id)
            }))
            .sort((a, b) => b.requests - a.requests || b.failedAttempts - a.failedAttempts);
    }

    static async #lastRequestAt(scope: UsageScope | null): Promise<string | null>{
        const row = await usage(EVERYTHING, scope).select(LAST_REQUEST, 'at').getRawOne<LastRow>();
        return row?.at ?? null;
    }
}
