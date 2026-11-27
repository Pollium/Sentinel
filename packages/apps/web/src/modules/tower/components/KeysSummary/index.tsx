import KeysPanel from '@/modules/tower/components/KeysPanel';
import BackLink from '@sentinel/ui/components/BackLink';
import QueryState from '@sentinel/ui/components/QueryState';
import Skeleton from '@sentinel/ui/components/Skeleton';
import { KeysOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useOutletContext } from 'react-router-dom';

const KeysSummary = () => {
    const { keys, overview } = useOutletContext<KeysOutlet>();

    return (
        <div className='flex flex-col gap-4'>
            <BackLink to='/keys' label='API keys' className='lg:hidden' />

            <QueryState
                query={overview}
                errorTitle='The gateway could not be reached'
                errorDescription='This is read straight from the gateway. Check that it is running and try again.'
                skeleton={<Skeleton className='h-[28rem] w-full rounded-2xl' />}
            >
                {(slice) => <KeysPanel slice={slice} keys={keys.data ?? []} />}
            </QueryState>
        </div>
    );
};

export default KeysSummary;
