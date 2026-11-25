import { GatewayKind, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { towerGateway } from '@sentinel/contracts/live/gateway';
import { providerRoutes } from '@sentinel/contracts/providers/routes';
import { Query, useQuery } from '@pollium/readable-react/query/useQuery';
import { useChannel } from '@sentinel/ui/hooks/socket/use-channel';
import { LiveProviders } from '@/modules/tower/contracts/tower-outlet';
import { KINDS } from '@/modules/tower/utils/kinds';
import '@/modules/tower/contracts/channel';

export const useLiveProviders = (): LiveProviders => {
    const byKind: Record<GatewayKind, Query<PublicGatewayProvider[]>> = {
        chat: useQuery(providerRoutes.providers, { path: { kind: 'chat' } }),
        voice: useQuery(providerRoutes.providers, { path: { kind: 'voice' } }),
        search: useQuery(providerRoutes.providers, { path: { kind: 'search' } })
    };
    const lists = KINDS.map((kind) => byKind[kind]);

    useChannel(towerGateway.channel, {
        'tower.provider.health': ({ providerId, health }) => {
            for(const list of lists){
                if(list.data?.some((provider) => provider.id === providerId)){
                    list.set(list.data.map((provider) => provider.id === providerId ? { ...provider, ...health } : provider));
                }
            }
        }
    });

    return {
        data: lists.every((list) => list.data !== null) ? lists.flatMap((list) => list.data ?? []) : null,
        loading: lists.some((list) => list.loading),
        error: lists.find((list) => list.error !== undefined)?.error,
        reload: () => lists.forEach((list) => list.reload())
    };
};
