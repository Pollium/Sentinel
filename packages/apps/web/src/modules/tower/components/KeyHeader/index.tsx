import KeyActions from '@/modules/tower/components/KeyActions';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';

interface KeyHeaderProps{
    apiKey: PublicGatewayApiKey;
    onRevoked: () => void;
}

const KeyHeader = ({ apiKey, onRevoked }: KeyHeaderProps) => {
    const used = apiKey.lastUsedAt === null ? 'Never used' : `Used ${formatAgo(apiKey.lastUsedAt)}`;

    return (
        <header className='flex flex-wrap items-start gap-4'>
            <div className='min-w-0 flex-1'>
                <h2 className='text-xl font-semibold text-foreground'>{apiKey.name}</h2>
                <p className='mt-0.5 flex items-center gap-2 text-[0.8125rem] text-muted'>
                    {apiKey.isActive ? null : <StatusDot tone='neutral' />}
                    <span className='min-w-0 truncate'>{apiKey.isActive ? used : `Off · ${used.toLowerCase()}`}</span>
                </p>
            </div>

            <KeyActions apiKey={apiKey} onRevoked={onRevoked} />
        </header>
    );
};

export default KeyHeader;
