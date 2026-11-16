const EMPTY_FILL = 4;
const PEAK_FILL = 86;

export const mixFill = (mix: number): string => `color-mix(in oklab, var(--foreground) ${mix}%, transparent)`;

export const heatFill = (share: number): string =>
    mixFill(share <= 0 ? EMPTY_FILL : EMPTY_FILL + Math.min(share, 1) * (PEAK_FILL - EMPTY_FILL));
