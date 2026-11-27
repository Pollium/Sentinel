import CompactList from '@sentinel/ui/components/CompactList';
import EmptyChart from '@sentinel/ui/components/EmptyChart';
import KeysCell from '@/modules/tower/components/KeysCell';
import PanelCell from '@sentinel/ui/components/PanelCell';
import PanelGrid from '@sentinel/ui/components/PanelGrid';
import RankedBars from '@sentinel/ui/components/RankedBars';
import { GatewayShare, GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { formatAgo, formatDate } from '@sentinel/ui/utils/format/format-date';
import { count, usd } from '@sentinel/ui/utils/format/format-metrics';
import { tenths } from '@sentinel/ui/utils/format/tenths';
import { isQuiet } from '@/modules/tower/utils/keys';
import { keyPath } from '@/modules/tower/utils/paths';

const SMALLEST_RATE = 0.001;

interface KeysPanelProps{
    slice: GatewayUsageSlice;
    keys: PublicGatewayApiKey[];
}

const failureRate = (share: GatewayShare): number => share.failedAttempts / Math.max(share.requests + share.failedAttempts, 1);

const KeysPanel = ({ slice, keys }: KeysPanelProps) => {
    const spenders = slice.keys.filter((share) => share.costUsd > 0).sort((a, b) => b.costUsd - a.costUsd);
    const rates = [...slice.keys].sort((a, b) => failureRate(b) - failureRate(a));
    const now = Date.now();
    const quiet = keys.filter((key) => isQuiet(key, now));
    const live = quiet.filter((key) => key.isActive);

    return (
        <div className='flex flex-col gap-10'>
            <header>
                <h2 className='text-xl font-semibold text-foreground'>All keys</h2>
                <p className='mt-0.5 text-[0.8125rem] text-muted'>Every request presents one, and its usage is reported under that key</p>
            </header>

            <PanelGrid>
                <KeysCell slice={slice} caption='called the gateway · requests by key' />

                <PanelCell title='Spend' figure={usd(slice.totals.costUsd)} caption='by key'>
                    {spenders.length === 0 ? <EmptyChart>Nothing was spent in this period.</EmptyChart> : (
                        <RankedBars bars={spenders.map((share) => ({ key: share.id, label: share.label, value: share.costUsd, display: usd(share.costUsd), note: `${count(share.requests)} requests` }))} />
                    )}
                </PanelCell>

                <PanelCell
                    title='Failure rate'
                    figure={rates.length === 0 ? '—' : tenths(rates[0].failedAttempts, rates[0].requests + rates[0].failedAttempts)}
                    caption={rates.length === 0 ? 'of attempts · by key' : `of attempts failed for ${rates[0].label} · by key`}
                >
                    {rates.length === 0 ? <EmptyChart>No traffic in this period.</EmptyChart> : (
                        <RankedBars
                            max={Math.max(...rates.map(failureRate), SMALLEST_RATE)}
                            bars={rates.map((share) => ({
                                key: share.id,
                                label: share.label,
                                value: failureRate(share),
                                display: tenths(share.failedAttempts, share.requests + share.failedAttempts),
                                note: `${count(share.failedAttempts)} failed attempts`
                            }))}
                        />
                    )}
                </PanelCell>

                <PanelCell
                    title='Quiet keys'
                    figure={count(quiet.length)}
                    caption='unused for 30 days · candidates to revoke'
                    tone={live.length === 0 ? undefined : 'warning'}
                    attention={live.length === 0 ? undefined : `${live.map((key) => key.name).join(', ')} still on`}
                >
                    <CompactList
                        empty='Every key was used in the last 30 days.'
                        rows={quiet.map((key) => ({
                            key: key.id,
                            label: key.name,
                            value: key.lastUsedAt === null ? `never · issued ${formatDate(key.createdAt)}` : `last ${formatAgo(key.lastUsedAt)}`,
                            tone: key.isActive ? 'warning' : 'neutral',
                            to: keyPath(key.id)
                        }))}
                    />
                </PanelCell>
            </PanelGrid>
        </div>
    );
};

export default KeysPanel;
