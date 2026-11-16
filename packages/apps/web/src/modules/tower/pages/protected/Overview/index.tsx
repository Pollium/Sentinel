import CacheCell from '@/modules/tower/components/CacheCell';
import FailuresCell from '@/modules/tower/components/FailuresCell';
import KeysCell from '@/modules/tower/components/KeysCell';
import KindCell from '@/modules/tower/components/KindCell';
import LatencyCell from '@/modules/tower/components/LatencyCell';
import LoadCell from '@/modules/tower/components/LoadCell';
import ModelsCell from '@/modules/tower/components/ModelsCell';
import OverviewHeadline from '@/modules/tower/components/OverviewHeadline';
import TowerPeriodMenu from '@/modules/tower/components/TowerPeriodMenu';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import Skeleton from '@sentinel/ui/components/Skeleton';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { useLiveOverview } from '@/modules/tower/hooks/use-live-overview';
import { useLiveProviders } from '@/modules/tower/hooks/use-live-providers';
import { KINDS } from '@/modules/tower/utils/kinds';

const Overview = () => {
    const [window] = usePeriod();
    const overview = useLiveOverview(window);
    const providers = useLiveProviders();

    return (
        <div className='mx-auto flex w-full max-w-[108rem] flex-col gap-12'>
            <PageToolbar title='Overview'>
                <TowerPeriodMenu />
            </PageToolbar>

            <QueryState
                query={overview}
                errorTitle='The gateway could not be reached'
                errorDescription='This is read straight from the gateway. Check that it is running and try again.'
                skeleton={<Skeleton className='h-[26rem] w-full rounded-2xl' />}
            >
                {(loaded) => (
                    <>
                        <OverviewHeadline overview={loaded} />

                        <div className='grid grid-cols-1 gap-x-14 gap-y-12 md:grid-cols-2 xl:grid-cols-3'>
                            {KINDS.map((kind) => <KindCell key={kind} kind={kind} slice={loaded} providers={providers.data ?? []} />)}
                            <ModelsCell slice={loaded} />
                            <KeysCell slice={loaded} caption='keys called the gateway · requests by key' />
                            <FailuresCell slice={loaded} />
                            <LatencyCell totals={loaded.totals} />
                            <CacheCell slice={loaded} />
                            <LoadCell title='Load' hours={loaded.hours} />
                        </div>
                    </>
                )}
            </QueryState>
        </div>
    );
};

export default Overview;
