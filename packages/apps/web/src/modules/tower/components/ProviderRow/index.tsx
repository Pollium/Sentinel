import ListRow from '@sentinel/ui/components/ListRow';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { useCoolingDown } from '@/modules/tower/hooks/use-cooling-down';
import { providerPath } from '@/modules/tower/utils/paths';
import { lookOf } from '@/modules/tower/utils/provider-look';

interface ProviderRowProps{
    provider: PublicGatewayProvider;
    share: string;
    isSelected: boolean;
}

const ProviderRow = ({ provider, share, isSelected }: ProviderRowProps) => {
    const look = lookOf(provider, useCoolingDown(provider.cooldownUntil));

    return (
        <ListRow
            to={providerPath(provider.id)}
            label={provider.name}
            isSelected={isSelected}
            leading={look.tone === null ? undefined : <StatusDot tone={look.tone} label={look.label} />}
            trailing={<span className='shrink-0 text-[0.75rem] tabular-nums text-muted'>{provider.isActive ? share : 'Off'}</span>}
        />
    );
};

export default ProviderRow;
