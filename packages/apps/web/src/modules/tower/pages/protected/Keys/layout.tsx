import IssueKeyButton from '@/modules/tower/components/IssueKeyButton';
import KeyList from '@/modules/tower/components/KeyList';
import TowerPeriodMenu from '@/modules/tower/components/TowerPeriodMenu';
import EmptyState from '@sentinel/ui/components/EmptyState';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import SkeletonList from '@sentinel/ui/components/SkeletonList';
import SplitView from '@sentinel/ui/components/SplitView';
import { KeysOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useQuery } from '@sentinel/ui/hooks/api/use-query';
import { towerApi } from '@/modules/tower/api/api';
import { useLiveOverview } from '@/modules/tower/hooks/use-live-overview';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { KeyRound } from 'lucide-react';
import { Outlet, useMatch, useParams } from 'react-router-dom';

const SKELETON_ROWS = 6;

const KeysLayout = () => {
    const params = useParams();
    const isAll = useMatch('/keys/all') !== null;
    const [window] = usePeriod();
    const keys = useQuery(towerApi.keys, []);
    const overview = useLiveOverview(window);
    const context: KeysOutlet = { keys, overview };
    const live = (keys.data ?? []).filter((key) => key.isActive).length;

    return (
        <>
            <PageToolbar title='API keys'>
                {keys.data === null ? null : <span className='hidden text-[0.8125rem] tabular-nums text-muted sm:inline'>{live} live</span>}
                <IssueKeyButton onIssued={keys.reload} />
                <TowerPeriodMenu />
            </PageToolbar>

            <SplitView
                isDetailFirst={params.id !== undefined || isAll}
                list={(
                    <QueryState
                        query={keys}
                        errorTitle='The keys could not be loaded'
                        errorDescription='Something interrupted the request. Check that the gateway is running and try again.'
                        skeleton={<SkeletonList count={SKELETON_ROWS} className='flex flex-col gap-2 px-3' itemClassName='h-7 w-full rounded-lg' />}
                        isEmpty={(loaded) => !loaded?.length}
                        empty={<EmptyState icon={KeyRound} title='No keys issued yet' description='Nobody can reach the gateway until one exists.' />}
                    >
                        {(loaded) => <KeyList keys={loaded} selectedId={params.id} isAllSelected={params.id === undefined} />}
                    </QueryState>
                )}
                detail={<Outlet context={context} />}
            />
        </>
    );
};

export default KeysLayout;
