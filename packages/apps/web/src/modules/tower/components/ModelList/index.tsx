import ContextMenu from '@sentinel/ui/components/ContextMenu';
import ListGroup from '@sentinel/ui/components/ListGroup';
import ListRow from '@sentinel/ui/components/ListRow';
import ShareMeter from '@sentinel/ui/components/ShareMeter';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { GatewayKind, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { GatewayShare } from '@sentinel/contracts/usage/domain';
import { copyText } from '@sentinel/ui/services/clipboard';
import { compact, usd } from '@sentinel/ui/utils/format/format-metrics';
import { sum } from '@sentinel/ui/utils/metrics/period';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { KIND_LABEL, KINDS } from '@/modules/tower/utils/kinds';
import { modelPath } from '@/modules/tower/utils/paths';
import { unpricedRoutes } from '@/modules/tower/utils/prices';
import { DropdownItem } from '@heroui/react';

const NO_TRAFFIC = '—';

interface ModelListProps{
    shares: GatewayShare[];
    providers: PublicGatewayProvider[];
    selected: string | undefined;
    isAllSelected: boolean;
}

interface ModelEntry{
    id: string;
    kind: GatewayKind;
    share: GatewayShare | undefined;
}

const figureOf = (entry: ModelEntry): number => entry.kind === 'chat' ? entry.share?.costUsd ?? 0 : entry.share?.requests ?? 0;

const trailingOf = (entry: ModelEntry): string => {
    if(entry.share === undefined) return NO_TRAFFIC;
    return entry.kind === 'chat' ? usd(entry.share.costUsd) : compact(entry.share.requests);
};

const fractionOf = (entry: ModelEntry, total: number): number => total === 0 ? 0 : figureOf(entry) / total;

const ModelList = ({ shares, providers, selected, isAllSelected }: ModelListProps) => {
    const byId = new Map(shares.map((share) => [share.id, share]));
    const routed = providers.filter((provider) => provider.kind === 'chat').flatMap((provider) => provider.models.map((model) => model.id));
    const entries: ModelEntry[] = [...new Set([...byId.keys(), ...routed])].map((id) => ({ id, kind: byId.get(id)?.kind ?? 'chat', share: byId.get(id) }));
    const unpriced = new Map(unpricedRoutes(providers).map(({ provider, model }) => [model.id, provider.name]));

    return (
        <>
            <div className='lg:hidden'>
                <ListRow to='/models/all' label='All models' isSelected={isAllSelected} />
            </div>
            {KINDS.map((kind) => {
                const own = entries.filter((entry) => entry.kind === kind).sort((a, b) => figureOf(b) - figureOf(a));
                if(own.length === 0) return null;

                const total = sum(own.map(figureOf));

                return (
                    <ListGroup key={kind} label={KIND_LABEL[kind]} total={own.length} tone={null}>
                        {own.map((entry) => {
                            const unpricedOn = unpriced.get(entry.id);

                            return (
                                <ContextMenu
                                    key={entry.id}
                                    menu={<DropdownItem onAction={() => { void copyText(entry.id, errorCopy); }}>Copy id</DropdownItem>}
                                >
                                    <ListRow
                                        to={modelPath(entry.id)}
                                        label={entry.id}
                                        isSelected={entry.id === selected}
                                        leading={unpricedOn === undefined ? undefined : <StatusDot tone='warning' label={`No price on ${unpricedOn}`} />}
                                        trailing={<ShareMeter fraction={fractionOf(entry, total)} label={trailingOf(entry)} isLabelShown={entry.id === selected} />}
                                    />
                                </ContextMenu>
                            );
                        })}
                    </ListGroup>
                );
            })}
        </>
    );
};

export default ModelList;
