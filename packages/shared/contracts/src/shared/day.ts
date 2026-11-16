export const utcDay = (date: Date = new Date()): string => date.toISOString().slice(0, 10);

const parseDay = (day: string): Date => new Date(`${day}T00:00:00.000Z`);

export const shiftDay = (day: string, days: number): string => {
    const date = parseDay(day);
    date.setUTCDate(date.getUTCDate() + days);
    return utcDay(date);
};
