import ProviderActions from '@/modules/tower/components/ProviderActions';
import ListRow from '@sentinel/ui/components/ListRow';
import ShareMeter from '@sentinel/ui/components/ShareMeter';
import StatusText from '@sentinel/ui/components/StatusText';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { useCoolingDown } from '@/modules/tower/hooks/use-cooling-down';
import { providerPath } from '@/modules/tower/utils/paths';
import { lookOf } from '@/modules/tower/utils/provider-look';
import { useNavigate } from 'react-router-dom';

interface ProviderRowProps{
    provider: PublicGatewayProvider;
    share: string;
    fraction: number;
    isSelected: boolean;
}

const ProviderRow = ({ provider, share, fraction, isSelected }: ProviderRowProps) => {
    const navigate = useNavigate();
    const look = lookOf(provider, useCoolingDown(provider.cooldownUntil));

    return (
        <ProviderActions
            provider={provider}
            onRemoved={() => {
                if(isSelected) void navigate('/providers');
            }}
        >
            <ListRow
                to={providerPath(provider.id)}
                label={provider.name}
                isSelected={isSelected}
                trailing={look.tone === null
                    ? <ShareMeter fraction={fraction} label={share} />
                    : <StatusText tone={look.tone}>{look.label}</StatusText>}
            />
        </ProviderActions>
    );
};

export default ProviderRow;
