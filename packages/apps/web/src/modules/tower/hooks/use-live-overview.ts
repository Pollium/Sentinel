import { GatewayOverview, UsageWindow } from '@sentinel/contracts/usage/domain';
import { towerGateway } from '@sentinel/contracts/live/gateway';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { Query, useQuery } from '@pollium/readable-react/query/useQuery';
import { useChannel } from '@sentinel/ui/hooks/socket/use-channel';
import '@/modules/tower/contracts/channel';
import { useEffect } from 'react';

export const useLiveOverview = (window: UsageWindow): Query<GatewayOverview> => {
    const overview = useQuery(usageRoutes.overview, { query: { window } });

    const keep = (pushed: GatewayOverview) => {
        if(pushed.window === window) overview.set(pushed);
    };

    const { send, status } = useChannel(towerGateway.channel, {
        'tower.watch': keep,
        'tower.overview': keep
    });

    useEffect(() => {
        if(status === 'open') send('tower.watch', { window });
    }, [send, status, window]);

    return overview;
};
