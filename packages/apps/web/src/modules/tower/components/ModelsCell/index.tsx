import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import RankedBars from '@sentinel/ui/components/RankedBars';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count, percent, usd } from '@sentinel/ui/utils/format/format-metrics';

interface ModelsCellProps{
    slice: GatewayUsageSlice;
}

const ModelsCell = ({ slice }: ModelsCellProps) => {
    const spent = slice.models.filter((model) => model.costUsd > 0).sort((a, b) => b.costUsd - a.costUsd);
    const unpriced = slice.totals.unpricedRequests;
    const top = spent.at(0);

    return (
        <PanelCell
            title='Models'
            figure={top === undefined ? '—' : percent(top.costUsd, slice.totals.costUsd)}
            caption={top === undefined ? 'of spend · by model' : `of spend is ${top.label} · spend by model`}
            tone={unpriced === 0 ? undefined : 'warning'}
            attention={unpriced === 0 ? undefined : `${count(unpriced)} requests have no price and count as $0`}
            to='/models'
        >
            {top === undefined ? <EmptyChart>Nothing was spent in this period.</EmptyChart> : (
                <RankedBars bars={spent.map((model) => ({ key: model.id, label: model.label, value: model.costUsd, display: usd(model.costUsd), note: `${count(model.requests)} requests` }))} />
            )}
        </PanelCell>
    );
};

export default ModelsCell;
