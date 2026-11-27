import CompactList from '@sentinel/ui/components/CompactList';
import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import PanelGrid from '@sentinel/ui/components/PanelGrid';
import RankedBars from '@sentinel/ui/components/RankedBars';
import FailuresCell from '@/modules/tower/components/FailuresCell';
import { GatewayShare, GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { count, usd } from '@sentinel/ui/utils/format/format-metrics';
import { tenths } from '@sentinel/ui/utils/format/tenths';
import { sum } from '@sentinel/ui/utils/metrics/period';
import { seconds } from '@/modules/tower/utils/latency';
import { providerPath } from '@/modules/tower/utils/paths';
import { flaggedOf, worstTone } from '@/modules/tower/utils/provider-look';

const SMALLEST_RATE = 0.001;

interface PoolPanelProps{
    slice: GatewayUsageSlice;
    providers: PublicGatewayProvider[];
}

const failureRate = (share: GatewayShare): number => share.failedAttempts / Math.max(share.requests + share.failedAttempts, 1);

const PoolPanel = ({ slice, providers }: PoolPanelProps) => {
    const flagged = flaggedOf(providers, Date.now());
    const spenders = slice.providers.filter((share) => share.kind === 'chat').sort((a, b) => b.costUsd - a.costUsd);
    const rates = [...slice.providers].sort((a, b) => failureRate(b) - failureRate(a));
    const slowest = [...slice.providers].filter((share) => share.requests > 0).sort((a, b) => b.medianLatencyMs - a.medianLatencyMs);
    const { requests } = slice.totals;

    return (
        <div className='flex flex-col gap-10'>
            <header>
                <h2 className='text-xl font-semibold text-foreground'>All providers</h2>
                <p className='mt-0.5 text-[0.8125rem] text-muted'>Each request goes to one picked at random among those serving the model</p>
            </header>

            <PanelGrid>
                <PanelCell
                    title='Needs you'
                    figure={count(flagged.length)}
                    caption={flagged.length === 1 ? 'provider not serving as usual' : 'providers not serving as usual'}
                    tone={worstTone(flagged.map(({ look }) => look.tone))}
                >
                    <CompactList
                        empty='Every provider that is on is serving.'
                        rows={flagged.map(({ provider, look }) => ({
                            key: provider.id,
                            label: provider.name,
                            value: look.label,
                            tone: look.tone ?? undefined,
                            to: providerPath(provider.id)
                        }))}
                    />
                </PanelCell>

                <PanelCell
                    title='Failure rate'
                    figure={rates.length === 0 ? '—' : tenths(rates[0].failedAttempts, rates[0].requests + rates[0].failedAttempts)}
                    caption={rates.length === 0 ? 'of attempts · by provider' : `of attempts failed on ${rates[0].label} · by provider`}
                >
                    {rates.length === 0 ? <EmptyChart>No traffic in this period.</EmptyChart> : (
                        <RankedBars
                            max={Math.max(...rates.map(failureRate), SMALLEST_RATE)}
                            bars={rates.map((share) => ({
                                key: share.id,
                                label: share.label,
                                value: failureRate(share),
                                display: tenths(share.failedAttempts, share.requests + share.failedAttempts),
                                note: `${count(share.failedAttempts)} of ${count(share.requests + share.failedAttempts)} attempts`
                            }))}
                        />
                    )}
                </PanelCell>

                <PanelCell title='Latency' figure={requests === 0 ? '—' : seconds(slice.totals.latency.medianMs)} caption='median · by provider'>
                    {slowest.length === 0 ? <EmptyChart>No request in this period.</EmptyChart> : (
                        <RankedBars bars={slowest.map((share) => ({ key: share.id, label: share.label, value: share.medianLatencyMs, display: seconds(share.medianLatencyMs) }))} />
                    )}
                </PanelCell>

                <PanelCell title='Spend' figure={usd(sum(spenders.map((share) => share.costUsd)))} caption='GenAI · by provider'>
                    {spenders.length === 0 ? <EmptyChart>Nothing was spent in this period.</EmptyChart> : (
                        <RankedBars bars={spenders.map((share) => ({ key: share.id, label: share.label, value: share.costUsd, display: usd(share.costUsd), note: `${count(share.requests)} requests` }))} />
                    )}
                </PanelCell>

                <FailuresCell slice={slice} />
            </PanelGrid>
        </div>
    );
};

export default PoolPanel;
