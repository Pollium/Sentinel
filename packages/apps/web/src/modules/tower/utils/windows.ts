import { USAGE_WINDOW_DAYS, UsageWindow } from '@sentinel/contracts/usage/domain';

export const WINDOWS = Object.values(UsageWindow);

export const windowLabel = (window: UsageWindow): string => {
    const days = USAGE_WINDOW_DAYS[window];
    return days === undefined ? 'All time' : `${days} days`;
};

export const daysOf = (window: UsageWindow): number | null => USAGE_WINDOW_DAYS[window] ?? null;

export const trendCaption = (window: UsageWindow): string => {
    const days = daysOf(window);
    return days === null ? 'per day' : `per day · dashed, the ${days} days before`;
};
