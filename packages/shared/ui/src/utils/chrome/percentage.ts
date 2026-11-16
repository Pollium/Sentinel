export const percentageOf = (value: number, total: number): number =>
    total === 0 ? 0 : Math.round((value / total) * 100);
