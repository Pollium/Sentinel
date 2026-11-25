import ModelsPanel from '@/modules/tower/components/ModelsPanel';
import OverviewState from '@/modules/tower/components/OverviewState';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useOutletContext } from 'react-router-dom';

const ModelsSummary = () => {
    const { providers, overview } = useOutletContext<TowerOutlet>();

    return <OverviewState overview={overview}>{(slice) => <ModelsPanel slice={slice} providers={providers.data ?? []} />}</OverviewState>;
};

export default ModelsSummary;
