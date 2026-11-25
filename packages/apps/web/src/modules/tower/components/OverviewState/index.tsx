import PanelSkeleton from '@sentinel/ui/components/PanelSkeleton';
import QueryState from '@sentinel/ui/components/QueryState';
import { GatewayOverview } from '@sentinel/contracts/usage/domain';
import { Query } from '@pollium/readable-react/query/useQuery';
import { ReactNode } from 'react';

interface OverviewStateProps{
    overview: Query<GatewayOverview>;
    children: (overview: GatewayOverview) => ReactNode;
}

const OverviewState = ({ overview, children }: OverviewStateProps) => (
    <QueryState
        query={overview}
        errorTitle='The gateway could not be reached'
        errorDescription='This is read straight from the gateway. Check that it is running and try again.'
        skeleton={<PanelSkeleton />}
    >
        {children}
    </QueryState>
);

export default OverviewState;
