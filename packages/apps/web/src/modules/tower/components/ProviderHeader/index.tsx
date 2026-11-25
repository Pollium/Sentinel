import ProviderActions from '@/modules/tower/components/ProviderActions';
import PaneHeader from '@sentinel/ui/components/PaneHeader';
import StatusText from '@sentinel/ui/components/StatusText';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { useCoolingDown } from '@/modules/tower/hooks/use-cooling-down';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';
import { KIND_LABEL } from '@/modules/tower/utils/kinds';
import { lookOf } from '@/modules/tower/utils/provider-look';

interface ProviderHeaderProps{
    provider: PublicGatewayProvider;
    share: string;
    onRemoved: () => void;
}

const ProviderHeader = ({ provider, share, onRemoved }: ProviderHeaderProps) => {
    const isCoolingDown = useCoolingDown(provider.cooldownUntil);
    const look = lookOf(provider, isCoolingDown);
    const back = isCoolingDown && provider.cooldownUntil !== null ? ` · back ${formatAgo(provider.cooldownUntil)}` : '';

    return (
        <PaneHeader
            title={provider.name}
            description={look.tone === null ? `Serving ${share} of ${KIND_LABEL[provider.kind]}` : <StatusText tone={look.tone}>{`${look.label}${back}`}</StatusText>}
        >
            <ProviderActions provider={provider} onRemoved={onRemoved} />
        </PaneHeader>
    );
};

export default ProviderHeader;
