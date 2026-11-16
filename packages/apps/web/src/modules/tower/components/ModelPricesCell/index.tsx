import CompactList from '@sentinel/ui/components/CompactList';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { providerPath } from '@/modules/tower/utils/paths';
import { isPriced, priceLine, ServedModel } from '@/modules/tower/utils/prices';

interface ModelPricesCellProps{
    routes: ServedModel[];
}

const ModelPricesCell = ({ routes }: ModelPricesCellProps) => {
    const priced = routes.filter((route) => isPriced(route.model)).length;

    return (
        <PanelCell
            title='Prices'
            figure={`${count(priced)} of ${count(routes.length)}`}
            caption='providers price it · per million tokens, in / out'
            tone={priced === routes.length ? undefined : 'warning'}
        >
            <CompactList
                empty='No provider routes it.'
                rows={routes.map(({ provider, model }) => ({
                    key: provider.id,
                    label: provider.name,
                    value: priceLine(model),
                    tone: isPriced(model) ? undefined : 'warning',
                    to: providerPath(provider.id)
                }))}
            />
        </PanelCell>
    );
};

export default ModelPricesCell;
