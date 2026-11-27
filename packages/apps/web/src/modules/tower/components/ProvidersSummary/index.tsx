import PoolPanel from '@/modules/tower/components/PoolPanel';
import BackLink from '@sentinel/ui/components/BackLink';
import QueryState from '@sentinel/ui/components/QueryState';
import Skeleton from '@sentinel/ui/components/Skeleton';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useOutletContext } from 'react-router-dom';

const ProvidersSummary = () => {
    const { providers, overview } = useOutletContext<TowerOutlet>();

    return (
        <div className='flex flex-col gap-4'>
            <BackLink to='/providers' label='Providers' className='lg:hidden' />

            <QueryState
                query={overview}
                errorTitle='The gateway could not be reached'
                errorDescription='This is read straight from the gateway. Check that it is running and try again.'
                skeleton={<Skeleton className='h-[28rem] w-full rounded-2xl' />}
            >
                {(slice) => <PoolPanel slice={slice} providers={providers.data ?? []} />}
            </QueryState>
        </div>
    );
};

export default ProvidersSummary;
