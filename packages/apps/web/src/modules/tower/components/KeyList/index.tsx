import KeyRow from '@/modules/tower/components/KeyRow';
import ListGroup from '@sentinel/ui/components/ListGroup';
import ListRow from '@sentinel/ui/components/ListRow';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { GatewayShare } from '@sentinel/contracts/usage/domain';
import { sum } from '@sentinel/ui/utils/metrics/period';
import { isQuiet } from '@/modules/tower/utils/keys';

interface KeyListProps{
    keys: PublicGatewayApiKey[];
    shares: GatewayShare[];
    selectedId: string | undefined;
    isAllSelected: boolean;
}

const KeyList = ({ keys, shares, selectedId, isAllSelected }: KeyListProps) => {
    const now = Date.now();
    const requests = new Map(shares.map((share) => [share.id, share.requests]));
    const total = sum([...requests.values()]);
    const rowOf = (key: PublicGatewayApiKey) => {
        const served = requests.get(key.id) ?? 0;

        return <KeyRow key={key.id} apiKey={key} requests={served} fraction={served === 0 ? 0 : served / total} isSelected={key.id === selectedId} />;
    };
    const byUse = [...keys].sort((a, b) => Date.parse(b.lastUsedAt ?? b.createdAt) - Date.parse(a.lastUsedAt ?? a.createdAt));
    const inUse = byUse.filter((key) => !isQuiet(key, now));
    const quiet = byUse.filter((key) => isQuiet(key, now));

    return (
        <>
            <div className='lg:hidden'>
                <ListRow to='/keys/all' label='All keys' isSelected={isAllSelected} />
            </div>
            {inUse.length === 0 ? null : <ListGroup label='In use' total={inUse.length} tone={null}>{inUse.map(rowOf)}</ListGroup>}
            {quiet.length === 0 ? null : <ListGroup label='Quiet for 30 days' total={quiet.length} tone={null}>{quiet.map(rowOf)}</ListGroup>}
        </>
    );
};

export default KeyList;
