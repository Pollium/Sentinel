import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import RankedBars from '@sentinel/ui/components/RankedBars';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';

interface ProviderModelsCellProps{
    provider: PublicGatewayProvider;
    slice: GatewayUsageSlice;
}

const ProviderModelsCell = ({ provider, slice }: ProviderModelsCellProps) => {
    const served = new Map(slice.models.map((share) => [share.id, share.requests]));
    const ids = [...new Set([...provider.models.map((model) => model.id), ...served.keys()])];
    const bars = ids
        .map((id) => ({
            key: id,
            label: id,
            value: served.get(id) ?? 0,
            display: count(served.get(id) ?? 0),
            note: provider.modelMap[id] === undefined ? undefined : `upstream ${provider.modelMap[id]}`
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <PanelCell
            title='Models'
            figure={count(ids.length)}
            caption={provider.kind === 'chat' ? 'routed here · requests by model' : 'requests by model'}
        >
            {bars.length === 0 ? <EmptyChart>No model was asked for in this period.</EmptyChart> : <RankedBars bars={bars} />}
        </PanelCell>
    );
};

export default ProviderModelsCell;
