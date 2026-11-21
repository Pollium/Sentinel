import ApiKeyForm from '@/modules/tower/components/ApiKeyForm';
import RecordActions from '@sentinel/ui/components/RecordActions';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { towerApi } from '@/modules/tower/api/api';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { ComponentProps } from 'react';

interface KeyActionsProps{
    apiKey: PublicGatewayApiKey;
    onChanged: () => void;
    onRevoked: () => void;
    children?: ComponentProps<typeof RecordActions>['children'];
}

const KeyActions = ({ apiKey, onChanged, onRevoked, children }: KeyActionsProps) => (
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
    >
        {children}
    </RecordActions>
);

export default KeyActions;
