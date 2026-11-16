import EmptyChart from '@sentinel/ui/components/EmptyChart';
import Meters from '@sentinel/ui/components/Meters';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { percent, tokens } from '@sentinel/ui/utils/format/format-metrics';
import { modelPath } from '@/modules/tower/utils/paths';

interface CacheCellProps{
    slice: GatewayUsageSlice;
}

const CacheCell = ({ slice }: CacheCellProps) => {
    const read = slice.models.filter((model) => model.inputTokens > 0);

    return (
        <PanelCell title='Cache' figure={percent(slice.totals.cachedTokens, slice.totals.inputTokens)} caption='of input tokens came from cache · by model'>
            {read.length === 0 ? <EmptyChart>No input tokens in this period.</EmptyChart> : (
                <Meters meters={read
                    .map((model) => ({
                        key: model.id,
                        label: model.label,
                        ratio: model.cachedTokens / model.inputTokens,
                        display: percent(model.cachedTokens, model.inputTokens),
                        note: `${tokens(model.cachedTokens)} of ${tokens(model.inputTokens)} input tokens`,
                        to: modelPath(model.id)
                    }))
                    .sort((a, b) => b.ratio - a.ratio)} />
            )}
        </PanelCell>
    );
};

export default CacheCell;
