import KeysPanel from '@/modules/tower/components/KeysPanel';
import OverviewState from '@/modules/tower/components/OverviewState';
import { KeysOutlet } from '@/modules/tower/contracts/tower-outlet';
import { useOutletContext } from 'react-router-dom';

const KeysSummary = () => {
    const { keys, overview } = useOutletContext<KeysOutlet>();

    return <OverviewState overview={overview}>{(slice) => <KeysPanel slice={slice} keys={keys.data ?? []} />}</OverviewState>;
};

export default KeysSummary;
