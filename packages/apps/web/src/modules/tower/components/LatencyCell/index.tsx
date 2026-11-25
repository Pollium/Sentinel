import Columns from '@sentinel/ui/components/Columns';
import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { GatewayTotals } from '@sentinel/contracts/usage/domain';
import { latencyColumns, seconds } from '@/modules/tower/utils/latency';
import { NO_REQUEST } from '@/modules/tower/utils/empty-copy';

interface LatencyCellProps{
    totals: GatewayTotals;
}

const LatencyCell = ({ totals }: LatencyCellProps) => (
    <PanelCell
        title='Latency'
        figure={totals.requests === 0 ? '—' : seconds(totals.latency.medianMs)}
        caption={totals.requests === 0 ? 'median, first byte to last' : `median, first byte to last · slowest 5% over ${seconds(totals.latency.slowestMs)}`}
    >
        {totals.requests === 0 ? <EmptyChart>{NO_REQUEST}</EmptyChart> : <Columns columns={latencyColumns(totals.latency)} />}
    </PanelCell>
);

export default LatencyCell;
