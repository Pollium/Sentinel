import ChartTip from '../ChartTip';
import PanelScroll from '../PanelScroll';
import { ChartSplit, ChartSplitLabels } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';
import { count } from '../../utils/format/format-metrics';
import { tenths } from '../../utils/format/tenths';

const PERCENT = 100;

interface SplitBarsProps{
    rows: ChartSplit[];
    labels: ChartSplitLabels;
}

const failedShare = (row: ChartSplit): string => `${tenths(row.failed, row.total)} failed`;

const SplitBars = ({ rows, labels }: SplitBarsProps) => {
    const { setRoot, tip, show, hide } = useChartTip();
    const top = Math.max(...rows.map((row) => row.total), 1);

    return (
        <div ref={setRoot} className='relative flex flex-col gap-3'>
            <PanelScroll onScroll={hide}>
                <ul className='flex flex-col gap-3'>
                    {rows.map((row) => {
                        const share = row.failed / Math.max(row.total, 1);

                        return (
                            <li
                                key={row.key}
                                className='flex flex-col gap-1.5'
                                onMouseEnter={(event) => show(event, { label: row.label, value: failedShare(row), note: `${count(row.total)} ${labels.unit} · ${count(row.failed)} ${labels.failed.toLowerCase()}` })}
                                onMouseLeave={hide}
                            >
                                <div className='flex items-baseline justify-between gap-3 text-[0.75rem]'>
                                    <span className='min-w-0 truncate text-foreground'>{row.label}</span>
                                    <span className='shrink-0 tabular-nums text-muted'>{failedShare(row)}</span>
                                </div>
                                <div className='flex h-2 gap-[2px]' style={{ width: `${(row.total / top) * PERCENT}%` }}>
                                    <div className={`h-full bg-foreground/25 ${row.failed === 0 ? 'rounded-r-[4px]' : 'rounded-l-[1px]'}`} style={{ width: `${(1 - share) * PERCENT}%` }} />
                                    {row.failed === 0 ? null : <div className='h-full min-w-[3px] rounded-r-[4px] bg-danger' style={{ width: `${share * PERCENT}%` }} />}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </PanelScroll>
            <ul className='flex gap-4 text-[0.75rem] text-muted'>
                <li className='flex items-center gap-1.5'><span aria-hidden='true' className='size-2 rounded-[2px] bg-foreground/25' />{labels.done}</li>
                <li className='flex items-center gap-1.5'><span aria-hidden='true' className='size-2 rounded-[2px] bg-danger' />{labels.failed}</li>
            </ul>
            {tip === null ? null : <ChartTip {...tip} />}
        </div>
    );
};

export default SplitBars;
