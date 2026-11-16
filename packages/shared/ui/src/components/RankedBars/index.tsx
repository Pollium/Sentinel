import ChartTip from '../ChartTip';
import PanelScroll from '../PanelScroll';
import { ChartBar } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';

const PERCENT = 100;
const SMALLEST_WIDTH = 2;

interface RankedBarsProps{
    bars: ChartBar[];
    max?: number;
}

const RankedBars = ({ bars, max }: RankedBarsProps) => {
    const { setRoot, tip, show, hide } = useChartTip();
    const top = max ?? Math.max(...bars.map((bar) => bar.value), 1);

    return (
        <div ref={setRoot} className='relative'>
            <PanelScroll onScroll={hide}>
                <ul className='flex flex-col gap-3'>
                    {bars.map((bar) => (
                        <li
                            key={bar.key}
                            className='flex flex-col gap-1.5'
                            onMouseEnter={(event) => show(event, { label: bar.label, value: bar.display, note: bar.note })}
                            onMouseLeave={hide}
                        >
                            <div className='flex items-baseline justify-between gap-3 text-[0.75rem]'>
                                <span className='min-w-0 truncate text-foreground'>{bar.label}</span>
                                <span className='shrink-0 tabular-nums text-muted'>{bar.display}</span>
                            </div>
                            <div className='h-2'>
                                <div
                                    className='h-full rounded-r-[4px] rounded-l-[1px] bg-foreground/80'
                                    style={{ width: `${Math.max(SMALLEST_WIDTH, (bar.value / top) * PERCENT)}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </PanelScroll>
            {tip === null ? null : <ChartTip {...tip} />}
        </div>
    );
};

export default RankedBars;
