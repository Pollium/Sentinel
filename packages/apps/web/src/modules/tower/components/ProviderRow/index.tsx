import ProviderActions from '@/modules/tower/components/ProviderActions';
import ListRow from '@sentinel/ui/components/ListRow';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { useCoolingDown } from '@/modules/tower/hooks/use-cooling-down';
import { providerPath } from '@/modules/tower/utils/paths';
import { lookOf } from '@/modules/tower/utils/provider-look';
import { useNavigate } from 'react-router-dom';

interface ProviderRowProps{
    provider: PublicGatewayProvider;
    share: string;
    isSelected: boolean;
    onChanged: () => void;
}

const ProviderRow = ({ provider, share, isSelected, onChanged }: ProviderRowProps) => {
    const navigate = useNavigate();
    const look = lookOf(provider, useCoolingDown(provider.cooldownUntil));

    return (
        <ProviderActions
            provider={provider}
            onChanged={onChanged}
            onRemoved={() => {
                if(isSelected) void navigate('/providers');
            }}
        >
            <ListRow
                to={providerPath(provider.id)}
                label={provider.name}
                isSelected={isSelected}
                leading={look.tone === null ? undefined : <StatusDot tone={look.tone} label={look.label} />}
                trailing={<span className='shrink-0 text-[0.75rem] tabular-nums text-muted'>{provider.isActive ? share : 'Off'}</span>}
            />
        </ProviderActions>
    );
};

export default ProviderRow;
