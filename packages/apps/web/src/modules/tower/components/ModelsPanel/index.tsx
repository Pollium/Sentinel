import CacheCell from '@/modules/tower/components/CacheCell';
import CompactList from '@sentinel/ui/components/CompactList';
import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import PanelGrid from '@sentinel/ui/components/PanelGrid';
import RankedBars from '@sentinel/ui/components/RankedBars';
import { GatewayShare, GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { compact, count, usd } from '@sentinel/ui/utils/format/format-metrics';
import { seconds } from '@/modules/tower/utils/latency';
import { sum } from '@sentinel/ui/utils/metrics/period';
import { modelPath } from '@/modules/tower/utils/paths';
import { unpricedRoutes } from '@/modules/tower/utils/prices';

const PER_THOUSAND = 1000;

interface ModelsPanelProps{
    slice: GatewayUsageSlice;
    providers: PublicGatewayProvider[];
}

const perRequest = (share: GatewayShare, value: number): number => value / Math.max(share.requests, 1);

const ModelsPanel = ({ slice, providers }: ModelsPanelProps) => {
    const chat = slice.models.filter((share) => share.kind === 'chat' && share.requests > 0);
    const spent = chat.filter((share) => share.costUsd > 0).sort((a, b) => b.costUsd - a.costUsd);
    const unpriced = unpricedRoutes(providers);
    const { costUsd, requests, unpricedRequests } = slice.totals;
    const chatRequests = sum(chat.map((share) => share.requests));
    const chatInput = sum(chat.map((share) => share.inputTokens));

    return (
        <div className='flex flex-col gap-10'>
            <header>
                <h2 className='text-xl font-semibold text-foreground'>All models</h2>
                <p className='mt-0.5 text-[0.8125rem] text-muted'>Spend is counted from the prices set on each provider</p>
            </header>

            <PanelGrid>
                <PanelCell title='Spend' figure={usd(costUsd)} caption='GenAI · by model'>
                    {spent.length === 0 ? <EmptyChart>Nothing was spent in this period.</EmptyChart> : (
                        <RankedBars bars={spent.map((share) => ({ key: share.id, label: share.label, value: share.costUsd, display: usd(share.costUsd), note: `${count(share.requests)} requests` }))} />
                    )}
                </PanelCell>

                <PanelCell title='Cost per 1,000 requests' figure={usd(chatRequests === 0 ? 0 : (costUsd / chatRequests) * PER_THOUSAND)} caption='across GenAI · by model'>
                    {spent.length === 0 ? <EmptyChart>Nothing was spent in this period.</EmptyChart> : (
                        <RankedBars bars={spent
                            .map((share) => ({ key: share.id, label: share.label, value: perRequest(share, share.costUsd) * PER_THOUSAND, display: usd(perRequest(share, share.costUsd) * PER_THOUSAND) }))
                            .sort((a, b) => b.value - a.value)} />
                    )}
                </PanelCell>

                <PanelCell title='Tokens per request' figure={compact(chatRequests === 0 ? 0 : chatInput / chatRequests)} caption='input on average · by model'>
                    {chat.length === 0 ? <EmptyChart>No GenAI request in this period.</EmptyChart> : (
                        <RankedBars bars={chat
                            .map((share) => ({
                                key: share.id,
                                label: share.label,
                                value: perRequest(share, share.inputTokens),
                                display: compact(perRequest(share, share.inputTokens)),
                                note: `${compact(perRequest(share, share.outputTokens))} out`
                            }))
                            .sort((a, b) => b.value - a.value)} />
                    )}
                </PanelCell>

                <CacheCell slice={slice} />

                <PanelCell title='Latency' figure={requests === 0 ? '—' : seconds(slice.totals.latency.medianMs)} caption='median · by model'>
                    {chat.length === 0 ? <EmptyChart>No GenAI request in this period.</EmptyChart> : (
                        <RankedBars bars={[...chat]
                            .sort((a, b) => b.medianLatencyMs - a.medianLatencyMs)
                            .map((share) => ({ key: share.id, label: share.label, value: share.medianLatencyMs, display: seconds(share.medianLatencyMs) }))} />
                    )}
                </PanelCell>

                <PanelCell
                    title='No price'
                    figure={count(unpricedRequests)}
                    caption='requests counted as $0 · routes without a price'
                    tone={unpricedRequests === 0 && unpriced.length === 0 ? undefined : 'warning'}
                >
                    <CompactList
                        empty='Every model is priced on every provider that serves it.'
                        rows={unpriced.map(({ provider, model }) => ({
                            key: `${provider.id}:${model.id}`,
                            label: model.id,
                            value: provider.name,
                            tone: 'warning' as const,
                            to: modelPath(model.id)
                        }))}
                    />
                </PanelCell>
            </PanelGrid>
        </div>
    );
};

export default ModelsPanel;
