import ChartTip from '../ChartTip';
import Meter from '../Meter';
import PanelScroll from '../PanelScroll';
import RankRow from '../RankRow';
import { ChartMeter } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';
import { Link } from 'react-router-dom';

interface MetersProps{
    meters: ChartMeter[];
}

const Meters = ({ meters }: MetersProps) => {
    const { setRoot, tip, show, hide } = useChartTip();

    return (
        <div ref={setRoot} className='relative'>
            <PanelScroll onScroll={hide}>
                <ul className='flex flex-col'>
                    {meters.map((meter) => {
                        const row = <RankRow label={meter.label} meter={<Meter fill={Math.min(1, meter.ratio)} failed={0} />} value={meter.display} />;

                        return (
                            <li
                                key={meter.key}
                                onMouseEnter={(event) => show(event, { label: meter.label, value: meter.display, note: meter.note })}
                                onMouseLeave={hide}
                            >
                                {meter.to === undefined ? row : <Link to={meter.to} className='block rounded-md hover:bg-selected'>{row}</Link>}
                            </li>
                        );
                    })}
                </ul>
            </PanelScroll>
            {tip === null ? null : <ChartTip {...tip} />}
        </div>
    );
};

export default Meters;
