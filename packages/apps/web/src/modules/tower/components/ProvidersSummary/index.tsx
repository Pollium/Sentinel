import OverviewState from '@/modules/tower/components/OverviewState';
import PoolPanel from '@/modules/tower/components/PoolPanel';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useOutletContext } from 'react-router-dom';

const ProvidersSummary = () => {
    const { providers, overview } = useOutletContext<TowerOutlet>();

    return <OverviewState overview={overview}>{(slice) => <PoolPanel slice={slice} providers={providers.data ?? []} />}</OverviewState>;
};

export default ProvidersSummary;
