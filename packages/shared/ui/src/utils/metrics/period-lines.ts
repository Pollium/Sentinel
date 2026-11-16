import { ChartLine, ChartPoint } from '../../contracts/chart';

export const periodLines = (label: string, current: ChartPoint[], previous: ChartPoint[], days: number): ChartLine[] => [
    { key: 'current', label, points: current, tone: 'ink' },
    { key: 'previous', label: `the ${days} days before`, points: previous, tone: 'gray', isDashed: true }
];
