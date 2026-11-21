import KeyActions from '@/modules/tower/components/KeyActions';
import ListRow from '@sentinel/ui/components/ListRow';
import ShareMeter from '@sentinel/ui/components/ShareMeter';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { keyPath } from '@/modules/tower/utils/paths';
import { useNavigate } from 'react-router-dom';

interface KeyRowProps{
    apiKey: PublicGatewayApiKey;
    requests: number;
    fraction: number;
    isSelected: boolean;
    onChanged: () => void;
}

const requestsLabel = (requests: number): string => `${count(requests)} ${requests === 1 ? 'request' : 'requests'}`;

const KeyRow = ({ apiKey, requests, fraction, isSelected, onChanged }: KeyRowProps) => {
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
                trailing={<ShareMeter fraction={fraction} label={requestsLabel(requests)} isLabelShown={isSelected} />}
            />
        </KeyActions>
    );
};

export default KeyRow;
