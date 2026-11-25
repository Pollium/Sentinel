import IssueKeyButton from '@/modules/tower/components/IssueKeyButton';
import KeyList from '@/modules/tower/components/KeyList';
import TowerPeriodMenu from '@/modules/tower/components/TowerPeriodMenu';
import EmptyState from '@sentinel/ui/components/EmptyState';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import SkeletonList from '@sentinel/ui/components/SkeletonList';
import SplitView from '@sentinel/ui/components/SplitView';
import { KeysOutlet } from '@/modules/tower/contracts/tower-outlet';
import { keyRoutes } from '@sentinel/contracts/keys/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { useLiveOverview } from '@/modules/tower/hooks/use-live-overview';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { Outlet, useMatch, useParams } from 'react-router-dom';
import { REQUEST_INTERRUPTED } from '@sentinel/ui/utils/format/state-copy';

const SKELETON_ROWS = 6;

const KeysLayout = () => {
    const params = useParams();
    const isAll = useMatch('/keys/all') !== null;
    const [window] = usePeriod();
    const keys = useQuery(keyRoutes.keys);
    const overview = useLiveOverview(window);
    const context: KeysOutlet = { keys, overview };
    const live = (keys.data ?? []).filter((key) => key.isActive).length;
    const selected = keys.data?.find((key) => key.id === params.id);

    return (
        <>
            <PageToolbar
                title='API keys'
                detail={selected === undefined ? undefined : { label: selected.name, parent: '/keys' }}
                note={keys.data === null ? undefined : `${live} live`}
            >
                <IssueKeyButton />
                <TowerPeriodMenu />
            </PageToolbar>

            <SplitView
                isDetailFirst={params.id !== undefined || isAll}
                list={(
                    <QueryState
                        query={keys}
                        errorTitle='The keys could not be loaded'
                        errorDescription={REQUEST_INTERRUPTED}
                        skeleton={<SkeletonList count={SKELETON_ROWS} />}
                        empty={<EmptyState title='No keys issued yet' description='Nobody can reach the gateway until one exists.' />}
                    >
                        {(loaded) => <KeyList keys={loaded} shares={overview.data?.keys ?? []} selectedId={params.id} isAllSelected={params.id === undefined} />}
                    </QueryState>
                )}
                detail={<Outlet context={context} />}
            />
        </>
    );
};

export default KeysLayout;
