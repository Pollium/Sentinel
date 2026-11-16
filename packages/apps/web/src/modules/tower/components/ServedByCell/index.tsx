import Meters from '@sentinel/ui/components/Meters';
import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count, percent } from '@sentinel/ui/utils/format/format-metrics';
import { tenths } from '@sentinel/ui/utils/format/tenths';
import { providerPath } from '@/modules/tower/utils/paths';

interface ServedByCellProps{
    slice: GatewayUsageSlice;
}

const ServedByCell = ({ slice }: ServedByCellProps) => {
    const { requests } = slice.totals;

    return (
        <PanelCell title='Providers' figure={count(slice.providers.length)} caption='served it · share of requests'>
            {slice.providers.length === 0 ? <EmptyChart>No provider served it in this period.</EmptyChart> : (
                <Meters meters={slice.providers.map((share) => ({
                    key: share.id,
                    label: share.label,
                    ratio: share.requests / Math.max(requests, 1),
                    display: percent(share.requests, requests),
                    note: `${tenths(share.failedAttempts, share.requests + share.failedAttempts)} of attempts failed`,
                    to: providerPath(share.id)
                }))} />
            )}
        </PanelCell>
    );
};

export default ServedByCell;
