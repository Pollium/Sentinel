import ChartTip from '../ChartTip';
import { ChartBar } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';

const TALLEST = 100;
const SHORTEST = 2;
const CROWDED_FROM = 8;

interface ColumnsProps{
    columns: ChartBar[];
}

const Columns = ({ columns }: ColumnsProps) => {
    const { setRoot, tip, show, hide } = useChartTip();
    const top = Math.max(...columns.map((column) => column.value), 1);
    const gap = columns.length > CROWDED_FROM ? 'gap-0.5' : 'gap-1.5';

    return (
        <div ref={setRoot} className='relative'>
            <div className={`flex h-24 items-end ${gap}`}>
                {columns.map((column) => (
                    <div
                        key={column.key}
                        className='group flex h-full min-w-0 flex-1 items-end'
                        onMouseEnter={(event) => show(event, { label: column.label, value: column.display, note: column.note })}
                        onMouseLeave={hide}
                    >
                        <div
                            className='w-full rounded-t-[3px] bg-bar transition-colors group-hover:bg-bar-strong motion-reduce:transition-none'
                            style={{ height: `${Math.max(SHORTEST, (column.value / top) * TALLEST)}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className={`mt-1.5 flex ${gap}`}>
                {columns.map((column) => (
                    <span key={column.key} className='min-w-0 flex-1 truncate text-center text-[0.6875rem] text-subtle'>{column.label}</span>
                ))}
            </div>
            {tip === null ? null : <ChartTip {...tip} />}
        </div>
    );
};

export default Columns;
