import FactList from '@sentinel/ui/components/FactList';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { formatAgo, formatDate } from '@sentinel/ui/utils/format/format-date';
import { count } from '@sentinel/ui/utils/format/format-metrics';

interface KeyFactsCellProps{
    apiKey: PublicGatewayApiKey;
}

const KeyFactsCell = ({ apiKey }: KeyFactsCellProps) => (
    <PanelCell title='Key' figure={apiKey.preview} caption='api_key'>
        <FactList facts={[
            { term: 'Status', value: apiKey.isActive ? 'Live' : 'Off', source: 'api_key.isActive' },
            { term: 'Issued', value: formatDate(apiKey.createdAt), source: 'api_key.createdAt' },
            {
                term: 'Last used',
                value: apiKey.lastUsedAt === null ? 'Never' : formatDate(apiKey.lastUsedAt),
                note: apiKey.lastUsedAt === null ? undefined : formatAgo(apiKey.lastUsedAt),
                source: 'usage.createdAt'
            },
            { term: 'Requests, all time', value: count(apiKey.requests), source: 'usage' }
        ]} />
    </PanelCell>
);

export default KeyFactsCell;
