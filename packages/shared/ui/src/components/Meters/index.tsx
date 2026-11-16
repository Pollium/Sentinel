import ChartTip from '../ChartTip';
import PanelScroll from '../PanelScroll';
import { ChartMeter } from '../../contracts/chart';
import { useChartTip } from '../../hooks/chrome/use-chart-tip';
import { Link } from 'react-router-dom';

const PERCENT = 100;
const METER = 'flex flex-col gap-1.5';

interface MetersProps{
    meters: ChartMeter[];
}

const Meters = ({ meters }: MetersProps) => {
    const { setRoot, tip, show, hide } = useChartTip();

    return (
        <div ref={setRoot} className='relative'>
            <PanelScroll onScroll={hide}>
                <ul className='flex flex-col gap-3'>
                    {meters.map((meter) => {
                        const content = (
                            <>
                                <div className='flex items-baseline justify-between gap-3 text-[0.75rem]'>
                                    <span className='min-w-0 truncate text-foreground'>{meter.label}</span>
                                    <span className='shrink-0 tabular-nums text-muted'>{meter.display}</span>
                                </div>
                                <div className='h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]'>
                                    <div className='h-full rounded-full bg-foreground/80' style={{ width: `${Math.min(1, meter.ratio) * PERCENT}%` }} />
                                </div>
                            </>
                        );

                        return (
                            <li
                                key={meter.key}
                                onMouseEnter={(event) => show(event, { label: meter.label, value: meter.display, note: meter.note })}
                                onMouseLeave={hide}
                            >
                                {meter.to === undefined
                                    ? <div className={METER}>{content}</div>
                                    : <Link to={meter.to} className={`${METER} -mx-1.5 -my-1 rounded-md px-1.5 py-1 hover:bg-foreground/[0.04]`}>{content}</Link>}
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
