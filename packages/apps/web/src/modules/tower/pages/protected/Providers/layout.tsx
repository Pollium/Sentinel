import AddProviderMenu from '@/modules/tower/components/AddProviderMenu';
import ProviderList from '@/modules/tower/components/ProviderList';
import TowerPeriodMenu from '@/modules/tower/components/TowerPeriodMenu';
import EmptyState from '@sentinel/ui/components/EmptyState';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import SkeletonList from '@sentinel/ui/components/SkeletonList';
import SplitView from '@sentinel/ui/components/SplitView';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { parseRouteId } from '@sentinel/ui/utils/routing/parse-route-id';
import { useLiveOverview } from '@/modules/tower/hooks/use-live-overview';
import { useLiveProviders } from '@/modules/tower/hooks/use-live-providers';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { isCoolingAt } from '@/modules/tower/utils/provider-look';
import { Outlet, useMatch, useParams } from 'react-router-dom';
import { REQUEST_INTERRUPTED } from '@sentinel/ui/utils/format/state-copy';

const SKELETON_ROWS = 8;

const ProvidersLayout = () => {
    const params = useParams();
    const isAll = useMatch('/providers/all') !== null;
    const [window] = usePeriod();
    const providers = useLiveProviders();
    const overview = useLiveOverview(window);
    const context: TowerOutlet = { providers, overview };
    const now = Date.now();
    const serving = providers.data?.filter((provider) => provider.isActive && !isCoolingAt(provider, now)).length ?? 0;
    const selectedId = parseRouteId(params.id);
    const selected = providers.data?.find((provider) => provider.id === selectedId);

    return (
        <>
            <PageToolbar
                title='Providers'
                detail={selected === undefined ? undefined : { label: selected.name, parent: '/providers' }}
                note={providers.data === null ? undefined : `${count(serving)} of ${count(providers.data.length)} serving`}
            >
                <AddProviderMenu />
                <TowerPeriodMenu />
            </PageToolbar>

            <SplitView
                isDetailFirst={selectedId !== undefined || isAll}
                list={(
                    <QueryState
                        query={providers}
                        errorTitle='The providers could not be loaded'
                        errorDescription={REQUEST_INTERRUPTED}
                        skeleton={<SkeletonList count={SKELETON_ROWS} />}
                        empty={<EmptyState compact title='No providers yet' description='Every request the gateway is asked for answers 503 until one serves it.' />}
                    >
                        {(loaded) => (
                            <ProviderList
                                providers={loaded}
                                shares={overview.data?.providers ?? []}
                                selectedId={selectedId}
                                isAllSelected={selectedId === undefined}
                            />
                        )}
                    </QueryState>
                )}
                detail={<Outlet context={context} />}
            />
        </>
    );
};

export default ProvidersLayout;
