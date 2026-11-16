const PERCENT = 100;

export const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

export const deltaOf = (current: number, previous: number): number | null =>
    previous === 0 ? null : (current - previous) / Math.abs(previous);

export const deltaLabel = (delta: number | null): string => {
    if(delta === null) return '';

    const change = Math.round(Math.abs(delta) * PERCENT);
    if(change === 0) return 'flat';

    return `${delta > 0 ? '↑' : '↓'} ${change}%`;
};
