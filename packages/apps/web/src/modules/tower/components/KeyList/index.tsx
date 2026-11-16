import ListGroup from '@sentinel/ui/components/ListGroup';
import ListRow from '@sentinel/ui/components/ListRow';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';
import { isQuiet } from '@/modules/tower/utils/keys';
import { keyPath } from '@/modules/tower/utils/paths';

interface KeyListProps{
    keys: PublicGatewayApiKey[];
    selectedId: string | undefined;
    isAllSelected: boolean;
}

const KeyList = ({ keys, selectedId, isAllSelected }: KeyListProps) => {
    const now = Date.now();
    const rowOf = (key: PublicGatewayApiKey) => (
        <ListRow
            key={key.id}
            to={keyPath(key.id)}
            label={key.name}
            isSelected={key.id === selectedId}
            leading={key.isActive ? undefined : <StatusDot tone='neutral' label='Off' />}
            trailing={<span className='shrink-0 text-[0.75rem] tabular-nums text-muted'>{key.lastUsedAt === null ? 'Never' : formatAgo(key.lastUsedAt)}</span>}
        />
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
