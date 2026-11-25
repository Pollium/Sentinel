import ProviderActions from '@/modules/tower/components/ProviderActions';
import StatusDot from '@sentinel/ui/components/StatusDot';
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
        <header className='flex flex-wrap items-start gap-4'>
            <div className='min-w-0 flex-1'>
                <h2 className='text-xl font-semibold text-foreground'>{provider.name}</h2>
                <p className='mt-0.5 flex items-center gap-2 text-[0.8125rem] text-muted'>
                    {look.tone === null ? null : <StatusDot tone={look.tone} />}
                    <span className='min-w-0 truncate'>
                        {look.tone === null ? `Serving ${share} of ${KIND_LABEL[provider.kind]}` : `${look.label}${back}`}
                    </span>
                </p>
            </div>

            <ProviderActions provider={provider} onRemoved={onRemoved} />
        </header>
    );
};

export default ProviderHeader;
