import FactList from '@sentinel/ui/components/FactList';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { formatAgo, formatDate } from '@sentinel/ui/utils/format/format-date';
import { count } from '@sentinel/ui/utils/format/format-metrics';

const BENCHED_AFTER = 3;

interface ProviderFactsCellProps{
    provider: PublicGatewayProvider;
    lastRequestAt: string | null;
}

const ProviderFactsCell = ({ provider, lastRequestAt }: ProviderFactsCellProps) => (
    <PanelCell title='Connection' figure={new URL(provider.baseUrl).host} caption='provider'>
        <FactList facts={[
            { term: 'Base URL', value: provider.baseUrl, source: 'provider.baseUrl' },
            { term: 'API key', value: 'Stored, encrypted', source: 'provider.encryptedApiKey' },
            {
                term: 'Failures in a row',
                value: count(provider.consecutiveFailures),
                note: `benched at ${BENCHED_AFTER}`,
                tone: provider.consecutiveFailures === 0 ? 'default' : 'warning'
            },
            { term: 'Last request', value: lastRequestAt === null ? 'Never' : formatAgo(lastRequestAt), source: 'usage.createdAt' },
            { term: 'Added', value: formatDate(provider.createdAt), source: 'provider.createdAt' }
        ]} />
    </PanelCell>
);

export default ProviderFactsCell;
