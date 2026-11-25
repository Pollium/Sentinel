import ProviderForm from '@/modules/tower/components/ProviderForm';
import RecordActions from '@sentinel/ui/components/RecordActions';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { providerRoutes } from '@sentinel/contracts/providers/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { ComponentProps } from 'react';

interface ProviderActionsProps{
    provider: PublicGatewayProvider;
    onRemoved: () => void;
    children?: ComponentProps<typeof RecordActions>['children'];
}

const ProviderActions = ({ provider, onRemoved, children }: ProviderActionsProps) => {
    const path = { id: provider.id };
    const invalidates = [providerRoutes.providers];
    const update = useMutation(providerRoutes.updateProvider, { path, invalidates });
    const discard = useMutation(providerRoutes.removeProvider, { path, invalidates, onSuccess: onRemoved });

    return (
        <RecordActions
            name={provider.name}
            noun='provider'
            isActive={provider.isActive}
            editTitle={`Edit ${provider.name}`}
            editWidth={provider.kind === 'chat' ? 'wide' : 'default'}
            errorCopy={errorCopy}
            update={update}
            remove={{
                label: 'Delete',
                description: 'The gateway stops routing to this upstream and its stored key is gone. This cannot be undone.',
                mutation: discard
            }}
            renderForm={(onSaved) => <ProviderForm kind={provider.kind} provider={provider} onSaved={onSaved} />}
        >
            {children}
        </RecordActions>
    );
};

export default ProviderActions;
