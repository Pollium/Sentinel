const PERCENT = 100;

export const tenths = (part: number, whole: number): string =>
    whole === 0 ? '0%' : `${((part / whole) * PERCENT).toFixed(1)}%`;
