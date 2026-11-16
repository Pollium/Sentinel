import Failure from '@/modules/providers/models/Failure';
import Usage from '@/modules/providers/models/Usage';
import { GatewayLive } from '@sentinel/contracts/usage/domain';
import { inFlight } from '@/modules/providers/services/proxy/InFlight';
import { SLOWEST_LATENCY } from '../utils/usage-figures';

export const LIVE_MINUTES = 30;
const MS_PER_MINUTE = 60_000;
const SECONDS_PER_MINUTE = 60;
const MINUTE = 'EXTRACT(EPOCH FROM date_trunc(\'minute\', row."createdAt"))';

interface MinuteRow{
    minute: string;
    requests: string;
    errors: string;
    tokens: string | null;
    slowestMs: string | null;
}

interface FailedMinuteRow{
    minute: string;
    attempts: string;
}

interface OpenRow{
    minute: string;
    open: string;
}

const usageTable = (): string => {
    const repository = Usage.getRepository();
    const { schema, tableName } = repository.metadata;
    const { driver } = repository.manager.connection;

    return schema === undefined ? driver.escape(tableName) : `${driver.escape(schema)}.${driver.escape(tableName)}`;
};

const openPerMinute = (since: Date): Promise<OpenRow[]> => Usage.query(
    `SELECT EXTRACT(EPOCH FROM slot) AS minute,
            SUM(EXTRACT(EPOCH FROM LEAST(row."createdAt", slot + interval '1 minute')
                - GREATEST(row."createdAt" - row."latencyMs" * interval '1 millisecond', slot))) / ${SECONDS_PER_MINUTE} AS open
       FROM ${usageTable()} row
 CROSS JOIN LATERAL generate_series(
            date_trunc('minute', row."createdAt" - row."latencyMs" * interval '1 millisecond'),
            date_trunc('minute', row."createdAt"),
            interval '1 minute'
        ) AS slot
      WHERE row."createdAt" >= $1 AND slot >= $1
   GROUP BY slot`,
    [since.toISOString()]
);

export default class LiveMinutesService{
    async read(): Promise<GatewayLive>{
        const first = Math.floor(Date.now() / MS_PER_MINUTE) - (LIVE_MINUTES - 1);
        const since = new Date(first * MS_PER_MINUTE);

        const [rows, failed, open] = await Promise.all([
            Usage.createQueryBuilder('row')
                .select(MINUTE, 'minute')
                .addSelect('COUNT(*)', 'requests')
                .addSelect('COUNT(*) FILTER (WHERE row.status >= 400)', 'errors')
                .addSelect('SUM(row."inputTokens" + row."outputTokens")', 'tokens')
                .addSelect(SLOWEST_LATENCY, 'slowestMs')
                .where('row."createdAt" >= :since', { since: since.toISOString() })
                .groupBy(MINUTE)
                .getRawMany<MinuteRow>(),
            Failure.createQueryBuilder('row')
                .select(MINUTE, 'minute')
                .addSelect('COUNT(*)', 'attempts')
                .where('row."createdAt" >= :since', { since: since.toISOString() })
                .groupBy(MINUTE)
                .getRawMany<FailedMinuteRow>(),
            openPerMinute(since)
        ]);

        const minuteOf = (raw: string): number => Math.trunc(Number(raw) / SECONDS_PER_MINUTE);
        const served = new Map(rows.map((row) => [minuteOf(row.minute), row]));
        const attempts = new Map(failed.map((row) => [minuteOf(row.minute), Number(row.attempts)]));
        const opened = new Map(open.map((row) => [minuteOf(row.minute), Number(row.open)]));

        return {
            inFlight: inFlight.count,
            minutes: Array.from({ length: LIVE_MINUTES }, (_, index) => {
                const minute = first + index;
                const row = served.get(minute);

                return {
                    at: new Date(minute * MS_PER_MINUTE).toISOString(),
                    requests: Number(row?.requests ?? 0),
                    errors: Number(row?.errors ?? 0),
                    failedAttempts: attempts.get(minute) ?? 0,
                    tokens: Number(row?.tokens ?? 0),
                    slowestMs: Math.round(Number(row?.slowestMs ?? 0)),
                    openRequests: opened.get(minute) ?? 0
                };
            })
        };
    }
}
