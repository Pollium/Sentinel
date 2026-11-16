import { USAGE_WINDOW_DAYS, UsageWindow } from '@sentinel/contracts/usage/domain';
import { UsageRange } from '../contracts/domain/usage';

const startOfDaysAgo = (days: number): Date => {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - days);
    return start;
};

export const rangeOf = (window: UsageWindow): UsageRange => {
    const days = USAGE_WINDOW_DAYS[window];
    return { since: days === undefined ? null : startOfDaysAgo(days - 1), until: null };
};

export const previousRangeOf = (window: UsageWindow): UsageRange | null => {
    const days = USAGE_WINDOW_DAYS[window];
    if(days === undefined) return null;

    return { since: startOfDaysAgo(2 * days - 1), until: startOfDaysAgo(days - 1) };
};
