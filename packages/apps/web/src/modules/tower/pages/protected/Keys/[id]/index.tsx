import KeyPanel from '@/modules/tower/components/KeyPanel';
import EmptyState from '@sentinel/ui/components/EmptyState';
import PanelSkeleton from '@sentinel/ui/components/PanelSkeleton';
import QueryState from '@sentinel/ui/components/QueryState';
import { KeysOutlet } from '@/modules/tower/contracts/tower-outlet';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { parseRouteId } from '@sentinel/ui/utils/routing/parse-route-id';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

const ApiKey = () => {
    const params = useParams();
    const navigate = useNavigate();
    const id = parseRouteId(params.id);
    const [window] = usePeriod();
    const { keys } = useOutletContext<KeysOutlet>();
    const usage = useQuery(usageRoutes.keyUsage, { path: { id }, query: { window } });
    const apiKey = keys.data?.find((entry) => entry.id === id);
    const isMissing = id === undefined || (keys.data !== null && apiKey === undefined);

    if(isMissing) return <EmptyState title='No such key' description='It may have been revoked. Pick another one from the list.' />;

    return (
        <QueryState query={usage} errorTitle='This key could not be measured' errorDescription={null} skeleton={<PanelSkeleton />}>
            {(slice) => apiKey === undefined ? <PanelSkeleton /> : (
                <KeyPanel
                    apiKey={apiKey}
                    slice={slice}
                    onRevoked={() => {
                        void navigate('/keys');
                    }}
                />
            )}
        </QueryState>
    );
};

export default ApiKey;
