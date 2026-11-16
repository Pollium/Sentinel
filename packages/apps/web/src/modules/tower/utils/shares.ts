import { ChartSplitLabels } from '@sentinel/ui/contracts/chart';
import { GatewayShare } from '@sentinel/contracts/usage/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { percent } from '@sentinel/ui/utils/format/format-metrics';
import { sum } from '@sentinel/ui/utils/metrics/period';

const NO_SHARE = '—';

export const SERVED_SPLIT: ChartSplitLabels = { done: 'Served', failed: 'Failed', unit: 'attempts' };

export const kindShare = (provider: PublicGatewayProvider, providers: PublicGatewayProvider[], shares: GatewayShare[]): string => {
    const requests = new Map(shares.map((share) => [share.id, share.requests]));
    const served = requests.get(provider.id) ?? 0;
    const total = sum(providers.filter((peer) => peer.kind === provider.kind).map((peer) => requests.get(peer.id) ?? 0));

    return served === 0 ? NO_SHARE : percent(served, total);
};
