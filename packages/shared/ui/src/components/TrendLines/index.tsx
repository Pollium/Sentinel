import ChartTip from '../ChartTip';
import { ChartLine } from '../../contracts/chart';
import { fullLabel } from '../../utils/format/chart-labels';
import { useState } from 'react';

const WIDTH = 300;
const HEIGHT = 120;
const PLOT_PX = 192;
const HEADROOM = 1.08;
const TIP_HALF_WIDTH = 80;
const PERCENT = 100;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DASH = '4 4';

interface TrendLinesProps{
    lines: ChartLine[];
    format: (value: number) => string;
}

const tickOf = (date: string): string => ISO_DAY.test(date) ? fullLabel(date) : date;

const TrendLines = ({ lines, format }: TrendLinesProps) => {
    const [hover, setHover] = useState<number | null>(null);
    const [width, setWidth] = useState(0);
    const [lead, ...rest] = lines;
    const length = lead.points.length;
    const top = Math.max(...lines.flatMap((line) => line.points.map((point) => point.value)), 1) * HEADROOM;
    const xOf = (index: number): number => (index / Math.max(1, length - 1)) * WIDTH;
    const yOf = (value: number): number => HEIGHT * (1 - value / top);
    const pathOf = (line: ChartLine): string => line.points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${xOf(index).toFixed(1)},${yOf(point.value).toFixed(1)}`)
        .join(' ');
    const ticks = [0, Math.floor((length - 1) / 2), length - 1];

    return (
        <div className='flex flex-col gap-2'>
            {lines.length < 2 ? null : (
                <ul className='flex gap-4 text-[0.75rem] text-muted'>
                    {lines.map((line) => (
                        <li key={line.key} className='flex items-center gap-1.5'>
                            {line.isDashed
                                ? <span aria-hidden='true' className='w-3 border-t border-dashed border-foreground/50' />
                                : <span aria-hidden='true' className={`h-0.5 w-3 rounded-full ${line.tone === 'ink' ? 'bg-foreground' : 'bg-foreground/35'}`} />}
                            {line.label}
                        </li>
                    ))}
                </ul>
            )}
            <div
                className='relative h-48'
                role='img'
                aria-label={lines.map((line) => line.label).join(', ')}
                onMouseMove={(event) => {
                    const box = event.currentTarget.getBoundingClientRect();
                    setWidth(box.width);
                    setHover(Math.round(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) * (length - 1)));
                }}
                onMouseLeave={() => setHover(null)}
            >
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio='none' className='absolute inset-0 size-full overflow-visible text-foreground'>
                    <line x1='0' x2={WIDTH} y1={HEIGHT} y2={HEIGHT} stroke='currentColor' strokeOpacity='0.12' vectorEffect='non-scaling-stroke' />
                    <line x1='0' x2={WIDTH} y1={HEIGHT / 2} y2={HEIGHT / 2} stroke='currentColor' strokeOpacity='0.06' vectorEffect='non-scaling-stroke' />
                    {lines.map((line) => (
                        <path
                            key={line.key}
                            d={pathOf(line)}
                            fill='none'
                            stroke='currentColor'
                            strokeOpacity={line.tone === 'ink' ? 1 : 0.35}
                            strokeWidth='2'
                            strokeDasharray={line.isDashed ? DASH : undefined}
                            strokeLinejoin='round'
                            vectorEffect='non-scaling-stroke'
                        />
                    ))}
                </svg>
                {hover === null ? null : (
                    <>
                        <span className='pointer-events-none absolute inset-y-0 w-px bg-foreground/15' style={{ left: `${(hover / Math.max(1, length - 1)) * PERCENT}%` }} />
                        <ChartTip
                            label={tickOf(lead.points[hover].date)}
                            value={`${lead.label} ${format(lead.points[hover].value)}`}
                            note={rest.length === 0 ? undefined : rest.map((line) => `${line.label} ${format(line.points[hover].value)}`).join(' · ')}
                            x={Math.min(Math.max((hover / Math.max(1, length - 1)) * width, TIP_HALF_WIDTH), width - TIP_HALF_WIDTH)}
                            y={(yOf(lead.points[hover].value) / HEIGHT) * PLOT_PX}
                        />
                    </>
                )}
            </div>
            <div className='flex justify-between text-[0.6875rem] tabular-nums text-muted'>
                {ticks.map((index) => <span key={index}>{tickOf(lead.points[index].date)}</span>)}
            </div>
        </div>
    );
};

export default TrendLines;
