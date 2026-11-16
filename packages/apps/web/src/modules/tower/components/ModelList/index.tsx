import ListGroup from '@sentinel/ui/components/ListGroup';
import ListRow from '@sentinel/ui/components/ListRow';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { GatewayKind, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { GatewayShare } from '@sentinel/contracts/usage/domain';
import { compact, usd } from '@sentinel/ui/utils/format/format-metrics';
import { KIND_LABEL, KINDS } from '@/modules/tower/utils/kinds';
import { modelPath } from '@/modules/tower/utils/paths';
import { unpricedRoutes } from '@/modules/tower/utils/prices';

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

const ModelList = ({ shares, providers, selected, isAllSelected }: ModelListProps) => {
    const byId = new Map(shares.map((share) => [share.id, share]));
    const routed = providers.filter((provider) => provider.kind === 'chat').flatMap((provider) => provider.models.map((model) => model.id));
    const entries: ModelEntry[] = [...new Set([...byId.keys(), ...routed])].map((id) => ({ id, kind: byId.get(id)?.kind ?? 'chat', share: byId.get(id) }));
    const unpriced = new Map(unpricedRoutes(providers).map(({ provider, model }) => [model.id, provider.name]));

    return (
        <>
            <ListRow to='/models/all' label='All models' isSelected={isAllSelected} />
            {KINDS.map((kind) => {
                const own = entries.filter((entry) => entry.kind === kind).sort((a, b) => figureOf(b) - figureOf(a));
                if(own.length === 0) return null;

                return (
                    <ListGroup key={kind} label={KIND_LABEL[kind]} total={own.length} tone={null}>
                        {own.map((entry) => {
                            const unpricedOn = unpriced.get(entry.id);

                            return (
                                <ListRow
                                    key={entry.id}
                                    to={modelPath(entry.id)}
                                    label={entry.id}
                                    isSelected={entry.id === selected}
                                    leading={unpricedOn === undefined ? undefined : <StatusDot tone='warning' label={`No price on ${unpricedOn}`} />}
                                    trailing={<span className='shrink-0 text-[0.75rem] tabular-nums text-muted'>{trailingOf(entry)}</span>}
                                />
                            );
                        })}
                    </ListGroup>
                );
            })}
        </>
    );
};

export default ModelList;
