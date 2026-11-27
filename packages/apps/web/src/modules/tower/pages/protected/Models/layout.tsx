import ModelList from '@/modules/tower/components/ModelList';
import TowerPeriodMenu from '@/modules/tower/components/TowerPeriodMenu';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import SkeletonList from '@sentinel/ui/components/SkeletonList';
import SplitView from '@sentinel/ui/components/SplitView';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useLiveOverview } from '@/modules/tower/hooks/use-live-overview';
import { useLiveProviders } from '@/modules/tower/hooks/use-live-providers';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { Outlet, useMatch, useParams } from 'react-router-dom';

const SKELETON_ROWS = 8;

const ModelsLayout = () => {
    const params = useParams();
    const isAll = useMatch('/models/all') !== null;
    const [window] = usePeriod();
    const providers = useLiveProviders();
    const overview = useLiveOverview(window);
    const context: TowerOutlet = { providers, overview };

    return (
        <>
            <PageToolbar title='Models'>
                <TowerPeriodMenu />
            </PageToolbar>

            <SplitView
                isDetailFirst={params.model !== undefined || isAll}
                list={(
                    <QueryState
                        query={overview}
                        errorTitle='The models could not be listed'
                        errorDescription='Something interrupted the request. Check that the gateway is running and try again.'
                        skeleton={<SkeletonList count={SKELETON_ROWS} className='flex flex-col gap-2 px-3' itemClassName='h-7 w-full rounded-lg' />}
                    >
                        {(loaded) => (
                            <ModelList
                                shares={loaded.models}
                                providers={providers.data ?? []}
                                selected={params.model}
                                isAllSelected={params.model === undefined}
                            />
                        )}
                    </QueryState>
                )}
                detail={<Outlet context={context} />}
            />
        </>
    );
};

export default ModelsLayout;
