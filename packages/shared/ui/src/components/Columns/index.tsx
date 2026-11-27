import ChartTip from '../ChartTip';
import { ChartBar } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';

const TALLEST = 82;
const SHORTEST = 2;
const CROWDED_FROM = 8;

interface ColumnsProps{
    columns: ChartBar[];
    isQuiet?: boolean;
}

const Columns = ({ columns, isQuiet = false }: ColumnsProps) => {
    const { setRoot, tip, show, hide } = useChartTip();
    const top = Math.max(...columns.map((column) => column.value), 1);
    const gap = columns.length > CROWDED_FROM ? 'gap-1' : 'gap-3';

    return (
        <div ref={setRoot} className='relative'>
            <div className={`flex h-36 items-end justify-around border-b border-foreground/[0.08] ${gap}`}>
                {columns.map((column) => (
                    <div
                        key={column.key}
                        className='flex h-full w-full max-w-12 flex-col items-center justify-end gap-1'
                        onMouseEnter={(event) => show(event, { label: column.label, value: column.display, note: column.note })}
                        onMouseLeave={hide}
                    >
                        {isQuiet ? null : <span className='text-[0.6875rem] tabular-nums text-muted'>{column.display}</span>}
                        <div
                            className='w-full max-w-6 rounded-t-[4px] bg-foreground/80'
                            style={{ height: `${Math.max(SHORTEST, (column.value / top) * TALLEST)}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className={`mt-1.5 flex justify-around ${gap}`}>
                {columns.map((column) => (
                    <span key={column.key} className='w-full max-w-12 truncate text-center text-[0.6875rem] text-muted'>{column.label}</span>
                ))}
            </div>
            {tip === null ? null : <ChartTip {...tip} />}
        </div>
    );
};

export default Columns;
