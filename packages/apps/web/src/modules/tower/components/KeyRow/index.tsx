import KeyActions from '@/modules/tower/components/KeyActions';
import ListRow from '@sentinel/ui/components/ListRow';
import ShareMeter from '@sentinel/ui/components/ShareMeter';
import StatusText from '@sentinel/ui/components/StatusText';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { keyPath } from '@/modules/tower/utils/paths';
import { useNavigate } from 'react-router-dom';

interface KeyRowProps{
    apiKey: PublicGatewayApiKey;
    requests: number;
    fraction: number;
    isSelected: boolean;
}

const requestsLabel = (requests: number): string => `${count(requests)} ${requests === 1 ? 'request' : 'requests'}`;

const KeyRow = ({ apiKey, requests, fraction, isSelected }: KeyRowProps) => {
    const navigate = useNavigate();

    return (
        <KeyActions
            apiKey={apiKey}
            onRevoked={() => {
                if(isSelected) void navigate('/keys');
            }}
        >
            <ListRow
                to={keyPath(apiKey.id)}
                label={apiKey.name}
                isSelected={isSelected}
                trailing={apiKey.isActive
                    ? <ShareMeter fraction={fraction} label={requestsLabel(requests)} />
                    : <StatusText tone='neutral'>Off</StatusText>}
            />
        </KeyActions>
    );
};

export default KeyRow;
