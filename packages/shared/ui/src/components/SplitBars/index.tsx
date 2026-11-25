import ChartTip from '../ChartTip';
import Meter from '../Meter';
import PanelScroll from '../PanelScroll';
import RankRow from '../RankRow';
import { ChartSplit, ChartSplitLabels } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';
import { count } from '../../utils/format/format-metrics';
import { tenths } from '../../utils/format/tenths';

interface SplitBarsProps{
    rows: ChartSplit[];
    labels: ChartSplitLabels;
}

const failedShare = (row: ChartSplit): string => `${tenths(row.failed, row.total)} failed`;

const SplitBars = ({ rows, labels }: SplitBarsProps) => {
    const { setRoot, tip, show, hide } = useChartTip();
    const top = Math.max(...rows.map((row) => row.total), 1);

    return (
        <div ref={setRoot} className='relative'>
            <PanelScroll onScroll={hide}>
                <ul className='flex flex-col'>
                    {rows.map((row) => (
                        <li
                            key={row.key}
                            onMouseEnter={(event) => show(event, { label: row.label, value: failedShare(row), note: `${count(row.total)} ${labels.unit} · ${count(row.failed)} ${labels.failed}` })}
                            onMouseLeave={hide}
                        >
                            <RankRow label={row.label} meter={<Meter fill={row.total / top} failed={row.failed / top} />} value={failedShare(row)} />
                        </li>
                    ))}
                </ul>
            </PanelScroll>
            {tip === null ? null : <ChartTip {...tip} />}
        </div>
    );
};

export default SplitBars;
