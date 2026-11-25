import { GatewayOverview, UsageWindow } from '@sentinel/contracts/usage/domain';
import { towerGateway } from '@sentinel/contracts/live/gateway';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { useChannel } from '@pollium/readable-react/live/useChannel';
import { Query, useQuery } from '@pollium/readable-react/query/useQuery';

export const useLiveOverview = (window: UsageWindow): Query<GatewayOverview> => {
    const overview = useQuery(usageRoutes.overview, { query: { window } });

    const keep = (pushed: GatewayOverview) => {
        if(pushed.window === window) overview.set(pushed);
    };

    useChannel(towerGateway, {
        'tower.watch': keep,
        'tower.overview': keep
    }, { join: ['tower.watch', { window }] });

    return overview;
};
