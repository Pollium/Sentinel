import { ChartSplitLabels } from '@sentinel/ui/contracts/chart';
import { GatewayShare } from '@sentinel/contracts/usage/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { percent } from '@sentinel/ui/utils/format/format-metrics';
import { sum } from '@sentinel/ui/utils/metrics/period';

const NO_SHARE = '—';

export const SERVED_SPLIT: ChartSplitLabels = { failed: 'failed', unit: 'attempts' };

interface KindServed{
    served: number;
    total: number;
}

const servedOf = (provider: PublicGatewayProvider, providers: PublicGatewayProvider[], shares: GatewayShare[]): KindServed => {
    const requests = new Map(shares.map((share) => [share.id, share.requests]));

    return {
        served: requests.get(provider.id) ?? 0,
        total: sum(providers.filter((peer) => peer.kind === provider.kind).map((peer) => requests.get(peer.id) ?? 0))
    };
};

export const kindShare = (provider: PublicGatewayProvider, providers: PublicGatewayProvider[], shares: GatewayShare[]): string => {
    const { served, total } = servedOf(provider, providers, shares);

    return served === 0 ? NO_SHARE : percent(served, total);
};

export const kindFraction = (provider: PublicGatewayProvider, providers: PublicGatewayProvider[], shares: GatewayShare[]): number => {
    const { served, total } = servedOf(provider, providers, shares);

    return served === 0 ? 0 : served / total;
};
