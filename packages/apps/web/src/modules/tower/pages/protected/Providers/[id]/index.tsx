import ProviderPanel from '@/modules/tower/components/ProviderPanel';
import BackLink from '@sentinel/ui/components/BackLink';
import EmptyState from '@sentinel/ui/components/EmptyState';
import QueryState from '@sentinel/ui/components/QueryState';
import Skeleton from '@sentinel/ui/components/Skeleton';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useQuery } from '@sentinel/ui/hooks/api/use-query';
import { parseRouteId } from '@sentinel/ui/utils/routing/parse-route-id';
import { towerApi } from '@/modules/tower/api/api';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { kindShare } from '@/modules/tower/utils/shares';
import { SearchX } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

const SKELETON = <Skeleton className='h-[28rem] w-full rounded-2xl' />;

const Provider = () => {
    const params = useParams();
    const navigate = useNavigate();
    const id = parseRouteId(params.id);
    const [window] = usePeriod();
    const { providers, overview } = useOutletContext<TowerOutlet>();
    const usage = useQuery(towerApi.providerUsage, [id, window]);
    const provider = providers.data?.find((entry) => entry.id === id);
    const isMissing = id === undefined || (providers.data !== null && provider === undefined);

    return (
        <div className='flex flex-col gap-4'>
            <BackLink to='/providers' label='Providers' className='lg:hidden' />

            {isMissing ? (
                <EmptyState icon={SearchX} title='No such provider' description='It may have been deleted. Pick another one from the list.' />
            ) : (
                <QueryState query={usage} errorTitle='This provider could not be measured' errorDescription={null} skeleton={SKELETON}>
                    {(slice) => provider === undefined ? SKELETON : (
                        <ProviderPanel
                            provider={provider}
                            slice={slice}
                            share={kindShare(provider, providers.data ?? [], overview.data?.providers ?? [])}
                            onChanged={() => {
                                providers.reload();
                                usage.reload();
                            }}
                            onRemoved={() => {
                                void navigate('/providers');
                            }}
                        />
                    )}
                </QueryState>
            )}
        </div>
    );
};

export default Provider;
