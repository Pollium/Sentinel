import { GatewayOverview, UsageWindow } from '@sentinel/contracts/usage/domain';
import { towerGateway } from '@sentinel/contracts/live/gateway';
import { Query } from '@sentinel/ui/contracts/api';
import { useQuery } from '@sentinel/ui/hooks/api/use-query';
import { useChannel } from '@sentinel/ui/hooks/socket/use-channel';
import { towerApi } from '@/modules/tower/api/api';
import '@/modules/tower/contracts/channel';
import { useEffect, useState } from 'react';

export const useLiveOverview = (window: UsageWindow): Query<GatewayOverview> => {
    const loaded = useQuery(towerApi.overview, [window]);
    const [pushed, setPushed] = useState<GatewayOverview | null>(null);

    const keep = (overview: GatewayOverview) => {
        if(overview.window === window) setPushed(overview);
    };

    const { send, status } = useChannel(towerGateway.channel, {
        'tower.watch': keep,
        'tower.overview': keep
    });

    useEffect(() => {
        if(status === 'open') send('tower.watch', { window });
    }, [send, status, window]);

    if(pushed === null || pushed.window !== window) return loaded;

    return {
        data: pushed,
        loading: false,
        error: undefined,
        reload: loaded.reload
    };
};
