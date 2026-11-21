import ProviderForm from '@/modules/tower/components/ProviderForm';
import RecordActions from '@sentinel/ui/components/RecordActions';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { towerApi } from '@/modules/tower/api/api';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { ComponentProps } from 'react';

interface ProviderActionsProps{
    provider: PublicGatewayProvider;
    onChanged: () => void;
    onRemoved: () => void;
    children?: ComponentProps<typeof RecordActions>['children'];
}

const ProviderActions = ({ provider, onChanged, onRemoved, children }: ProviderActionsProps) => (
    <RecordActions
        name={provider.name}
        noun='provider'
        isActive={provider.isActive}
        editTitle={`Edit ${provider.name}`}
        editWidth={provider.kind === 'chat' ? 'wide' : 'default'}
        errorCopy={errorCopy}
        onSetActive={(isActive) => towerApi.updateProvider(provider.id, { isActive })}
        remove={{
            label: 'Delete',
            description: 'The gateway stops routing to this upstream and its stored key is gone. This cannot be undone.',
            run: async () => {
                await towerApi.removeProvider(provider.id);
                onRemoved();
            }
        }}
        onChanged={onChanged}
        renderForm={(onSaved) => <ProviderForm kind={provider.kind} provider={provider} onSaved={onSaved} />}
    >
        {children}
    </RecordActions>
);

export default ProviderActions;
