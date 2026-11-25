import ProviderPanel from '@/modules/tower/components/ProviderPanel';
import EmptyState from '@sentinel/ui/components/EmptyState';
import PanelSkeleton from '@sentinel/ui/components/PanelSkeleton';
import QueryState from '@sentinel/ui/components/QueryState';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { parseRouteId } from '@sentinel/ui/utils/routing/parse-route-id';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { kindShare } from '@/modules/tower/utils/shares';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

const Provider = () => {
    const params = useParams();
    const navigate = useNavigate();
    const id = parseRouteId(params.id);
    const [window] = usePeriod();
    const { providers, overview } = useOutletContext<TowerOutlet>();
    const usage = useQuery(usageRoutes.providerUsage, { path: { id }, query: { window } });
    const provider = providers.data?.find((entry) => entry.id === id);
    const isMissing = id === undefined || (providers.data !== null && provider === undefined);

    if(isMissing) return <EmptyState title='No such provider' description='It may have been deleted. Pick another one from the list.' />;

    return (
        <QueryState query={usage} errorTitle='This provider could not be measured' errorDescription={null} skeleton={<PanelSkeleton />}>
            {(slice) => provider === undefined ? <PanelSkeleton /> : (
                <ProviderPanel
                    provider={provider}
                    slice={slice}
                    share={kindShare(provider, providers.data ?? [], overview.data?.providers ?? [])}
                    onRemoved={() => {
                        void navigate('/providers');
                    }}
                />
            )}
        </QueryState>
    );
};

export default Provider;
