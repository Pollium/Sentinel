import { GatewayProviderHealth, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { towerGateway } from '@sentinel/contracts/live/gateway';
import { Query } from '@sentinel/ui/contracts/api';
import { useQuery } from '@sentinel/ui/hooks/api/use-query';
import { useKeyedState } from '@sentinel/ui/hooks/selection/use-keyed-state';
import { useChannel } from '@sentinel/ui/hooks/socket/use-channel';
import { towerApi } from '@/modules/tower/api/api';
import '@/modules/tower/contracts/channel';
import { invalidateCache } from 'alova';

export const useLiveProviders = (): Query<PublicGatewayProvider[]> => {
    const loaded = useQuery(towerApi.providers, []);
    const [health, setHealth] = useKeyedState<Record<string, GatewayProviderHealth>>(loaded.data, () => ({}));

    useChannel(towerGateway.channel, {
        'tower.provider.health': (change) => {
            void invalidateCache();
            setHealth((current) => ({
                ...current,
                [change.providerId]: change.health
            }));
        }
    });

    if(loaded.data === null) return loaded;

    return {
        ...loaded,
        data: loaded.data.map((provider) => ({
            ...provider,
            ...health[provider.id]
        })),
        reload: () => {
            void invalidateCache();
            loaded.reload();
        }
    };
};
