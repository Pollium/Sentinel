import HeadlineTile from '@sentinel/ui/components/HeadlineTile';
import TrendLines from '@sentinel/ui/components/TrendLines';
import { HeadlineMetric } from '@sentinel/ui/contracts/chart';
import { GatewayOverview } from '@sentinel/contracts/usage/domain';
import { periodLines } from '@sentinel/ui/utils/metrics/period-lines';
import { liveTiles, periodTiles } from '@/modules/tower/utils/headline';
import { useState } from 'react';

const FIRST_TILE = 'requests';
const ROW = 'grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5';

interface OverviewHeadlineProps{
    overview: GatewayOverview;
}

const linesOf = (metric: HeadlineMetric) => metric.previous.length === 0
    ? [{ key: 'current', label: metric.label, points: metric.current, tone: 'ink' as const }]
    : periodLines(metric.label, metric.current, metric.previous, metric.days);

const OverviewHeadline = ({ overview }: OverviewHeadlineProps) => {
    const [selected, setSelected] = useState(FIRST_TILE);
    const period = periodTiles(overview);
    const now = liveTiles(overview.live);
    const chosen = [...period, ...now].find((metric) => metric.key === selected) ?? period[0];
    const tileOf = (metric: HeadlineMetric) => (
        <HeadlineTile key={metric.key} metric={metric} isSelected={metric.key === chosen.key} onSelect={() => setSelected(metric.key)} />
    );

    return (
        <section aria-label='Headline' className='flex flex-col gap-6'>
            <div role='tablist' aria-label='Headline figures' className='flex flex-col gap-5'>
                <div className={ROW}>{period.map(tileOf)}</div>
                <div className={ROW}>{now.map(tileOf)}</div>
            </div>
            <div role='tabpanel' aria-label={chosen.label}>
                <TrendLines key={`${chosen.key}:${overview.window}`} lines={linesOf(chosen)} format={chosen.format} />
            </div>
        </section>
    );
};

export default OverviewHeadline;
