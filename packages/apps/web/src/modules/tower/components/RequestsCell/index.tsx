import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import TrendLines from '@sentinel/ui/components/TrendLines';
import { ChartLine } from '@sentinel/ui/contracts/chart';
import { GatewayUsageDay, GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { periodLines } from '@sentinel/ui/utils/metrics/period-lines';
import { daysOf } from '@/modules/tower/utils/windows';

const LABEL = 'Requests';

interface RequestsCellProps{
    slice: GatewayUsageSlice;
    caption: string;
}

const pointsOf = (days: GatewayUsageDay[]) => days.map((day) => ({ date: day.date, value: day.requests }));

const linesOf = (slice: GatewayUsageSlice): ChartLine[] => {
    const days = daysOf(slice.window);
    const current = pointsOf(slice.days);

    return days === null ? [{ key: 'current', label: LABEL, points: current, tone: 'ink' }] : periodLines(LABEL, current, pointsOf(slice.previousDays), days);
};

const RequestsCell = ({ slice, caption }: RequestsCellProps) => {
    const isQuiet = slice.totals.requests === 0 && (slice.previous?.requests ?? 0) === 0;

    return (
        <PanelCell title={LABEL} figure={count(slice.totals.requests)} caption={caption} isWide>
            {isQuiet ? <EmptyChart>No request in this period or the one before.</EmptyChart> : <TrendLines lines={linesOf(slice)} format={count} />}
        </PanelCell>
    );
};

export default RequestsCell;
