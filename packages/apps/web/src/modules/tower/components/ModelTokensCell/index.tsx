import FactList from '@sentinel/ui/components/FactList';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { GatewayTotals } from '@sentinel/contracts/usage/domain';
import { compact, percent, tokens } from '@sentinel/ui/utils/format/format-metrics';

interface ModelTokensCellProps{
    totals: GatewayTotals;
    contextWindow: number | null;
}

const perRequest = (value: number, requests: number): string => compact(requests === 0 ? 0 : value / requests);

const ModelTokensCell = ({ totals, contextWindow }: ModelTokensCellProps) => (
    <PanelCell title='Tokens' figure={tokens(totals.inputTokens + totals.outputTokens)} caption={`${percent(totals.cachedTokens, totals.inputTokens)} of input from cache`}>
        <FactList facts={[
            { term: 'Input', value: tokens(totals.inputTokens), note: `${perRequest(totals.inputTokens, totals.requests)} per request` },
            { term: 'From cache', value: tokens(totals.cachedTokens), note: 'billed at the cached price' },
            { term: 'Output', value: tokens(totals.outputTokens), note: `${perRequest(totals.outputTokens, totals.requests)} per request` },
            { term: 'Context window', value: contextWindow === null ? '—' : compact(contextWindow) }
        ]} />
    </PanelCell>
);

export default ModelTokensCell;
