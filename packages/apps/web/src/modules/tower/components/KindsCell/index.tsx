import EmptyChart from '@sentinel/ui/components/EmptyChart';
import Meters from '@sentinel/ui/components/Meters';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { percent } from '@sentinel/ui/utils/format/format-metrics';
import { sum } from '@sentinel/ui/utils/metrics/period';
import { KIND_LABEL, KINDS } from '@/modules/tower/utils/kinds';
import { NO_REQUEST } from '@/modules/tower/utils/empty-copy';

interface KindsCellProps{
    slice: GatewayUsageSlice;
}

const KindsCell = ({ slice }: KindsCellProps) => {
    const { requests } = slice.totals;
    const perKind = KINDS
        .map((kind) => ({ kind, requests: sum(slice.models.filter((share) => share.kind === kind).map((share) => share.requests)) }))
        .filter((entry) => entry.requests > 0)
        .sort((a, b) => b.requests - a.requests);
    const top = perKind.at(0);

    return (
        <PanelCell
            title='Kinds'
            figure={top === undefined ? '—' : percent(top.requests, requests)}
            caption={top === undefined ? 'share of requests' : `${KIND_LABEL[top.kind]} · share of requests`}
        >
            {top === undefined ? <EmptyChart>{NO_REQUEST}</EmptyChart> : (
                <Meters meters={perKind.map((entry) => ({
                    key: entry.kind,
                    label: KIND_LABEL[entry.kind],
                    ratio: entry.requests / requests,
                    display: percent(entry.requests, requests)
                }))} />
            )}
        </PanelCell>
    );
};

export default KindsCell;
