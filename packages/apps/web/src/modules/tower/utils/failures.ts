import { ChartBar } from '@sentinel/ui/contracts/chart';
import { GatewayFailureCause, GatewayFailureCount } from '@sentinel/contracts/usage/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';

const CAUSE_LABEL: Record<Exclude<GatewayFailureCause, 'rejected'>, string> = {
    unreachable: 'No answer',
    'out-of-credits': 'Out of credits',
    unreadable: 'Unreadable answer'
};

const STATUS_LABEL: Record<number, string> = {
    401: 'Key refused',
    403: 'Key refused',
    404: 'Not found',
    408: 'Timed out',
    429: 'Rate limited',
    500: 'Server error',
    502: 'Bad gateway',
    503: 'Unavailable',
    504: 'Timed out'
};

const labelOf = (failure: GatewayFailureCount): string => failure.cause === 'rejected'
    ? STATUS_LABEL[failure.status] ?? `Answered ${failure.status}`
    : CAUSE_LABEL[failure.cause];

export const failureBars = (failures: GatewayFailureCount[]): ChartBar[] => {
    const grouped = new Map<string, number>();
    for(const failure of failures) grouped.set(labelOf(failure), (grouped.get(labelOf(failure)) ?? 0) + failure.attempts);

    return [...grouped.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, attempts]) => ({ key: label, label, value: attempts, display: count(attempts) }));
};
