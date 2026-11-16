export const dayLabel = (date: string): string => String(Number(date.slice(8, 10)));

export const fullLabel = (date: string): string => new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
});
