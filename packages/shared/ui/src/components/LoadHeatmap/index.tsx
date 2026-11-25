import { HeatCell } from '../../contracts/metrics';
import { heatFill, mixFill } from '../../utils/format/heat-fill';
import { WEEKDAYS } from '../../utils/format/weekdays';

const HOURS_PER_DAY = 24;
const HOURS = Array.from({ length: HOURS_PER_DAY }, (_, hour) => hour);
const HOUR_TICKS = new Set([0, 3, 6, 9, 12, 15, 18, 21]);
const LEGEND_MIXES = [4, 20, 36, 52, 70, 86] as const;

const padHour = (hour: number): string => String(hour).padStart(2, '0');

interface LoadHeatmapProps{
    cells: HeatCell[];
    unit: string;
}

const valuesAt = (cells: HeatCell[]): Map<string, number> =>
    new Map(cells.map((cell) => [`${cell.isoWeekday}-${cell.hour}`, cell.value]));

const LoadHeatmap = ({ cells, unit }: LoadHeatmapProps) => {
    const peak = Math.max(0, ...cells.map((cell) => cell.value));
    const counted = valuesAt(cells);

    return (
        <div className='flex flex-col gap-0.5'>
            {WEEKDAYS.map((weekday, index) => {
                const isoWeekday = index + 1;

                return (
                    <div key={weekday} className='flex items-center gap-0.5'>
                        <span className='w-6 shrink-0 text-[0.625rem] text-muted'>{weekday}</span>
                        {HOURS.map((hour) => {
                            const value = counted.get(`${isoWeekday}-${hour}`) ?? 0;

                            return (
                                <span
                                    key={hour}
                                    title={`${weekday} ${padHour(hour)}:00 · ${value} ${unit}`}
                                    className='aspect-square min-w-0 flex-1 rounded-[2px]'
                                    style={{ background: heatFill(peak === 0 ? 0 : value / peak) }}
                                />
                            );
                        })}
                    </div>
                );
            })}

            <div className='flex items-center gap-0.5 pl-6'>
                {HOURS.map((hour) => (
                    <span key={hour} className='min-w-0 flex-1 text-center text-[0.5625rem] tabular-nums text-muted'>
                        {HOUR_TICKS.has(hour) ? padHour(hour) : ''}
                    </span>
                ))}
            </div>

            <div className='flex items-center gap-1.5 text-[0.6875rem] text-muted'>
                Quiet
                {LEGEND_MIXES.map((mix) => (
                    <span
                        key={mix}
                        className='h-1.5 w-3.5 rounded-[2px]'
                        style={{ background: mixFill(mix) }}
                    />
                ))}
                Peak · {peak} {unit}/h
            </div>
        </div>
    );
};

export default LoadHeatmap;
