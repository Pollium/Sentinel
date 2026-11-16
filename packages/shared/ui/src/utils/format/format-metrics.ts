import { percentageOf } from '../chrome/percentage';

const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact' });

export const count = (value: number): string => value.toLocaleString('en-US');

export const compact = (value: number): string => COMPACT.format(value);

export const rate = (value: number): string => Number.isInteger(value)
    ? count(value)
    : value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const tokens = (value: number): string => value === 0 ? '—' : compact(value);

export const percent = (part: number, whole: number): string => `${percentageOf(part, whole)}%`;

export const usd = (value: number): string => {
    const magnitude = Math.abs(value);
    const digits = magnitude !== 0 && magnitude < 1 ? 4 : 2;
    const amount = magnitude.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

    return `${value < 0 ? '−' : ''}$${amount}`;
};
