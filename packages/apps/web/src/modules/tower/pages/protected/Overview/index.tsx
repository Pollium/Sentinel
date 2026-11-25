import CacheCell from '@/modules/tower/components/CacheCell';
import FailuresCell from '@/modules/tower/components/FailuresCell';
import KeysCell from '@/modules/tower/components/KeysCell';
import KindCell from '@/modules/tower/components/KindCell';
import LatencyCell from '@/modules/tower/components/LatencyCell';
import LoadCell from '@/modules/tower/components/LoadCell';
import ModelsCell from '@/modules/tower/components/ModelsCell';
import OverviewHeadline from '@/modules/tower/components/OverviewHeadline';
import OverviewState from '@/modules/tower/components/OverviewState';
import TowerPeriodMenu from '@/modules/tower/components/TowerPeriodMenu';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import PanelGrid from '@sentinel/ui/components/PanelGrid';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { useLiveOverview } from '@/modules/tower/hooks/use-live-overview';
import { useLiveProviders } from '@/modules/tower/hooks/use-live-providers';
import { KINDS } from '@/modules/tower/utils/kinds';

const Overview = () => {
    const [window] = usePeriod();
    const overview = useLiveOverview(window);
    const providers = useLiveProviders();

    return (
        <>
            <PageToolbar title='Overview'>
                <TowerPeriodMenu />
            </PageToolbar>

            <OverviewState overview={overview}>
                {(loaded) => (
                    <div className='flex flex-col pb-16'>
                        <OverviewHeadline overview={loaded} />

                        <PanelGrid>
                            {KINDS.map((kind) => <KindCell key={kind} kind={kind} slice={loaded} providers={providers.data ?? []} />)}
                            <ModelsCell slice={loaded} />
                            <KeysCell slice={loaded} caption='keys called the gateway · requests by key' />
                            <FailuresCell slice={loaded} />
                            <LatencyCell totals={loaded.totals} />
                            <CacheCell slice={loaded} />
                            <LoadCell title='Load' hours={loaded.hours} />
                        </PanelGrid>
                    </div>
                )}
            </OverviewState>
        </>
    );
};

export default Overview;
