import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import SplitBars from '@sentinel/ui/components/SplitBars';
import { GatewayKind, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { tenths } from '@sentinel/ui/utils/format/tenths';
import { sum } from '@sentinel/ui/utils/metrics/period';
import { KIND_LABEL } from '@/modules/tower/utils/kinds';
import { attentionOf, flaggedOf, worstTone } from '@/modules/tower/utils/provider-look';
import { SERVED_SPLIT } from '@/modules/tower/utils/shares';

interface KindCellProps{
    kind: GatewayKind;
    slice: GatewayUsageSlice;
    providers: PublicGatewayProvider[];
}

const KindCell = ({ kind, slice, providers }: KindCellProps) => {
    const own = providers.filter((provider) => provider.kind === kind);
    const shares = slice.providers.filter((share) => share.kind === kind);
    const requests = sum(shares.map((share) => share.requests));
    const failed = sum(shares.map((share) => share.failedAttempts));
    const flagged = flaggedOf(own, Date.now());

    return (
        <PanelCell
            title={KIND_LABEL[kind]}
            figure={count(requests)}
            caption={`requests · ${tenths(failed, requests + failed)} of attempts failed · by provider`}
            tone={worstTone(flagged.map(({ look }) => look.tone))}
            attention={attentionOf(flagged)}
            to='/providers'
        >
            {shares.length === 0 ? <EmptyChart>No {KIND_LABEL[kind]} traffic in this period.</EmptyChart> : (
                <SplitBars
                    labels={SERVED_SPLIT}
                    rows={shares.map((share) => ({ key: share.id, label: share.label, total: share.requests + share.failedAttempts, failed: share.failedAttempts }))}
                />
            )}
        </PanelCell>
    );
};

export default KindCell;
