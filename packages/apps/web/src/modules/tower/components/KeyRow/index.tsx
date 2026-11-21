import KeyActions from '@/modules/tower/components/KeyActions';
import ListRow from '@sentinel/ui/components/ListRow';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';
import { keyPath } from '@/modules/tower/utils/paths';
import { useNavigate } from 'react-router-dom';

interface KeyRowProps{
    apiKey: PublicGatewayApiKey;
    isSelected: boolean;
    onChanged: () => void;
}

const KeyRow = ({ apiKey, isSelected, onChanged }: KeyRowProps) => {
    const navigate = useNavigate();

    return (
        <KeyActions
            apiKey={apiKey}
            onChanged={onChanged}
            onRevoked={() => {
                if(isSelected) void navigate('/keys');
            }}
        >
            <ListRow
                to={keyPath(apiKey.id)}
                label={apiKey.name}
                isSelected={isSelected}
                leading={apiKey.isActive ? undefined : <StatusDot tone='neutral' label='Off' />}
                trailing={<span className='shrink-0 text-[0.75rem] tabular-nums text-muted'>{apiKey.lastUsedAt === null ? 'Never' : formatAgo(apiKey.lastUsedAt)}</span>}
            />
        </KeyActions>
    );
};

export default KeyRow;
