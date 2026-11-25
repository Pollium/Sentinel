import KeyPanel from '@/modules/tower/components/KeyPanel';
import BackLink from '@sentinel/ui/components/BackLink';
import EmptyState from '@sentinel/ui/components/EmptyState';
import QueryState from '@sentinel/ui/components/QueryState';
import Skeleton from '@sentinel/ui/components/Skeleton';
import { KeysOutlet } from '@/modules/tower/contracts/tower-outlet';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { parseRouteId } from '@sentinel/ui/utils/routing/parse-route-id';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { SearchX } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

const SKELETON = <Skeleton className='h-[28rem] w-full rounded-2xl' />;

const ApiKey = () => {
    const params = useParams();
    const navigate = useNavigate();
    const id = parseRouteId(params.id);
    const [window] = usePeriod();
    const { keys } = useOutletContext<KeysOutlet>();
    const usage = useQuery(usageRoutes.keyUsage, { path: { id }, query: { window } });
    const apiKey = keys.data?.find((entry) => entry.id === id);
    const isMissing = id === undefined || (keys.data !== null && apiKey === undefined);

    return (
        <div className='flex flex-col gap-4'>
            <BackLink to='/keys' label='API keys' className='lg:hidden' />

            {isMissing ? (
                <EmptyState icon={SearchX} title='No such key' description='It may have been revoked. Pick another one from the list.' />
            ) : (
                <QueryState query={usage} errorTitle='This key could not be measured' errorDescription={null} skeleton={SKELETON}>
                    {(slice) => apiKey === undefined ? SKELETON : (
                        <KeyPanel
                            apiKey={apiKey}
                            slice={slice}
                            onRevoked={() => {
                                void navigate('/keys');
                            }}
                        />
                    )}
                </QueryState>
            )}
        </div>
    );
};

export default ApiKey;
