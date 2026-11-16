import CompactList from '@sentinel/ui/components/CompactList';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { ProviderModel } from '@sentinel/contracts/providers/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { modelPath } from '@/modules/tower/utils/paths';
import { isPriced, priceLine } from '@/modules/tower/utils/prices';

interface ProviderPricesCellProps{
    models: ProviderModel[];
}

const ProviderPricesCell = ({ models }: ProviderPricesCellProps) => {
    const priced = models.filter(isPriced).length;

    return (
        <PanelCell
            title='Prices'
            figure={`${count(priced)} of ${count(models.length)}`}
            caption='models priced · per million tokens, in / out'
            tone={priced === models.length ? undefined : 'warning'}
        >
            <CompactList
                empty='No model is routed here.'
                rows={models.map((model) => ({
                    key: model.id,
                    label: model.id,
                    value: priceLine(model),
                    tone: isPriced(model) ? undefined : 'warning',
                    to: modelPath(model.id)
                }))}
            />
        </PanelCell>
    );
};

export default ProviderPricesCell;
