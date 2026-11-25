import KeyActions from '@/modules/tower/components/KeyActions';
import PaneHeader from '@sentinel/ui/components/PaneHeader';
import StatusText from '@sentinel/ui/components/StatusText';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';

interface KeyHeaderProps{
    apiKey: PublicGatewayApiKey;
    onRevoked: () => void;
}

const KeyHeader = ({ apiKey, onRevoked }: KeyHeaderProps) => {
    const used = apiKey.lastUsedAt === null ? 'Never used' : `Used ${formatAgo(apiKey.lastUsedAt)}`;

    return (
        <PaneHeader title={apiKey.name} description={apiKey.isActive ? used : <StatusText tone='neutral'>{`Off · ${used.toLowerCase()}`}</StatusText>}>
            <KeyActions apiKey={apiKey} onRevoked={onRevoked} />
        </PaneHeader>
    );
};

export default KeyHeader;
