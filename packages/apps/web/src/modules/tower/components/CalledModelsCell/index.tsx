import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import RankedBars from '@sentinel/ui/components/RankedBars';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count, usd } from '@sentinel/ui/utils/format/format-metrics';

interface CalledModelsCellProps{
    slice: GatewayUsageSlice;
}

const CalledModelsCell = ({ slice }: CalledModelsCellProps) => (
    <PanelCell title='Models' figure={count(slice.models.length)} caption='it called · requests by model'>
        {slice.models.length === 0 ? <EmptyChart>No model was called in this period.</EmptyChart> : (
            <RankedBars bars={slice.models.map((share) => ({ key: share.id, label: share.label, value: share.requests, display: count(share.requests), note: usd(share.costUsd) }))} />
        )}
    </PanelCell>
);

export default CalledModelsCell;
