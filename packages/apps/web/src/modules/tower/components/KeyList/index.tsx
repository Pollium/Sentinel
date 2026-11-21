import KeyRow from '@/modules/tower/components/KeyRow';
import ListGroup from '@sentinel/ui/components/ListGroup';
import ListRow from '@sentinel/ui/components/ListRow';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { isQuiet } from '@/modules/tower/utils/keys';

interface KeyListProps{
    keys: PublicGatewayApiKey[];
    selectedId: string | undefined;
    isAllSelected: boolean;
    onChanged: () => void;
}

const KeyList = ({ keys, selectedId, isAllSelected, onChanged }: KeyListProps) => {
    const now = Date.now();
    const rowOf = (key: PublicGatewayApiKey) => (
        <KeyRow key={key.id} apiKey={key} isSelected={key.id === selectedId} onChanged={onChanged} />
    );
    const byUse = [...keys].sort((a, b) => Date.parse(b.lastUsedAt ?? b.createdAt) - Date.parse(a.lastUsedAt ?? a.createdAt));
    const inUse = byUse.filter((key) => !isQuiet(key, now));
    const quiet = byUse.filter((key) => isQuiet(key, now));

    return (
        <>
            <ListRow to='/keys/all' label='All keys' isSelected={isAllSelected} />
            {inUse.length === 0 ? null : <ListGroup label='In use' total={inUse.length} tone={null}>{inUse.map(rowOf)}</ListGroup>}
            {quiet.length === 0 ? null : <ListGroup label='Quiet for 30 days' total={quiet.length} tone={null}>{quiet.map(rowOf)}</ListGroup>}
        </>
    );
};

export default KeyList;
