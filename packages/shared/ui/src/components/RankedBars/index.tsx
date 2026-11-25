import ChartTip from '../ChartTip';
import Meter from '../Meter';
import PanelScroll from '../PanelScroll';
import RankRow from '../RankRow';
import { ChartBar } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';

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
                <ul className='flex flex-col'>
                    {bars.map((bar) => (
                        <li
                            key={bar.key}
                            onMouseEnter={(event) => show(event, { label: bar.label, value: bar.display, note: bar.note })}
                            onMouseLeave={hide}
                        >
                            <RankRow label={bar.label} meter={<Meter fill={bar.value / top} failed={0} />} value={bar.display} />
                        </li>
                    ))}
                </ul>
            </PanelScroll>
            {tip === null ? null : <ChartTip {...tip} />}
        </div>
    );
};

export default RankedBars;
