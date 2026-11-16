import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import RankedBars from '@sentinel/ui/components/RankedBars';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count, usd } from '@sentinel/ui/utils/format/format-metrics';

interface KeysCellProps{
    slice: GatewayUsageSlice;
    caption: string;
}

const KeysCell = ({ slice, caption }: KeysCellProps) => (
    <PanelCell title='API keys' figure={count(slice.keys.length)} caption={caption} to='/keys'>
        {slice.keys.length === 0 ? <EmptyChart>No key called the gateway in this period.</EmptyChart> : (
            <RankedBars bars={slice.keys.map((key) => ({ key: key.id, label: key.label, value: key.requests, display: count(key.requests), note: usd(key.costUsd) }))} />
        )}
    </PanelCell>
);

export default KeysCell;
