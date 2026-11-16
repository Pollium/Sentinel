import ApiKeyForm from '@/modules/tower/components/ApiKeyForm';
import RecordActions from '@sentinel/ui/components/RecordActions';
import StatusDot from '@sentinel/ui/components/StatusDot';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { towerApi } from '@/modules/tower/api/api';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';

interface KeyHeaderProps{
    apiKey: PublicGatewayApiKey;
    onChanged: () => void;
    onRevoked: () => void;
}

const KeyHeader = ({ apiKey, onChanged, onRevoked }: KeyHeaderProps) => {
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

            <RecordActions
                name={apiKey.name}
                noun='key'
                isActive={apiKey.isActive}
                editTitle={`Edit ${apiKey.name}`}
                errorCopy={errorCopy}
                onSetActive={(isActive) => towerApi.updateKey(apiKey.id, { isActive })}
                remove={{
                    label: 'Revoke',
                    description: 'Every request presenting this key starts answering 401 immediately. This cannot be undone.',
                    run: async () => {
                        await towerApi.removeKey(apiKey.id);
                        onRevoked();
                    }
                }}
                onChanged={onChanged}
                renderForm={(onSaved) => <ApiKeyForm apiKey={apiKey} onDone={onSaved} />}
            />
        </header>
    );
};

export default KeyHeader;
