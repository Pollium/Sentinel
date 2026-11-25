import ApiKeyForm from '@/modules/tower/components/ApiKeyForm';
import RecordActions from '@sentinel/ui/components/RecordActions';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { keyRoutes } from '@sentinel/contracts/keys/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { ComponentProps } from 'react';

interface KeyActionsProps{
    apiKey: PublicGatewayApiKey;
    onRevoked: () => void;
    children?: ComponentProps<typeof RecordActions>['children'];
}

const KeyActions = ({ apiKey, onRevoked, children }: KeyActionsProps) => {
    const path = { id: apiKey.id };
    const update = useMutation(keyRoutes.updateKey, { path });
    const revoke = useMutation(keyRoutes.removeKey, { path, onSuccess: onRevoked });

    return (
        <RecordActions
            name={apiKey.name}
            noun='key'
            isActive={apiKey.isActive}
            editTitle={`Edit ${apiKey.name}`}
            errorCopy={errorCopy}
            update={update}
            remove={{
                label: 'Revoke',
                description: 'Every request presenting this key starts answering 401 immediately. This cannot be undone.',
                mutation: revoke
            }}
            renderForm={(onSaved) => <ApiKeyForm apiKey={apiKey} onDone={onSaved} />}
        >
            {children}
        </RecordActions>
    );
};

export default KeyActions;
