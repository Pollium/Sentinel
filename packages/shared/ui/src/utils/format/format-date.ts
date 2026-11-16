export const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const RELATIVE = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

const MS_PER_SECOND = 1000;

const AGO_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60]
];

export const formatAgo = (iso: string): string => {
    const seconds = (Date.parse(iso) - Date.now()) / MS_PER_SECOND;
    const [unit, size] = AGO_UNITS.find(([, span]) => Math.abs(seconds) >= span) ?? ['second', 1];

    return RELATIVE.format(Math.round(seconds / size), unit);
};
