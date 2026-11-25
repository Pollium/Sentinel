import ActionMenu from '../ActionMenu';
import ConfirmDialog from '../ConfirmDialog';
import ContextMenu from '../ContextMenu';
import Modal from '../Modal';
import { notifyWith } from '../../services/notify';
import { ErrorCopy } from '@pollium/readable-react/errors/copy';
import { Mutation } from '@pollium/readable-react/query/useMutation';
import { DropdownItem } from '@heroui/react';
import { ComponentProps, ReactNode, useState } from 'react';

interface RecordRemoval{
    label: string;
    description: string;
    mutation: Mutation<never, unknown>;
}

interface RecordActionsProps{
    name: string;
    noun: string;
    isActive: boolean;
    editTitle: string;
    editWidth?: 'default' | 'wide';
    errorCopy: ErrorCopy;
    update: Mutation<{ isActive: boolean }, unknown>;
    remove: RecordRemoval;
    renderForm: (onSaved: () => void) => ReactNode;
    children?: ComponentProps<typeof ContextMenu>['children'];
}

const RecordActions = ({
    name,
    noun,
    isActive,
    editTitle,
    editWidth,
    errorCopy,
    update,
    remove,
    renderForm,
    children
}: RecordActionsProps) => {
    const [editing, setEditing] = useState(false);
    const [removing, setRemoving] = useState(false);

    const toggleActive = () => {
        void update.run({ body: { isActive: !isActive } })
            .catch(notifyWith(errorCopy, {
                title: isActive ? `Couldn't turn off the ${noun}` : `Couldn't turn on the ${noun}`,
                retry: toggleActive
            }));
    };

    const isBusy = update.loading || remove.mutation.loading;
    const items = (
        <>
            <DropdownItem isDisabled={isBusy} onAction={() => setEditing(true)}>Edit</DropdownItem>
            <DropdownItem isDisabled={isBusy} onAction={toggleActive}>{isActive ? 'Deactivate' : 'Activate'}</DropdownItem>
            <DropdownItem isDisabled={isBusy} variant='danger' onAction={() => setRemoving(true)}>{remove.label}</DropdownItem>
        </>
    );

    return (
        <>
            {children === undefined ? (
                <ActionMenu subject={name} isDisabled={isBusy}>{items}</ActionMenu>
            ) : (
                <ContextMenu menu={items}>{children}</ContextMenu>
            )}

            <Modal isOpen={editing} onOpenChange={setEditing} title={editTitle} width={editWidth}>
                {renderForm(() => setEditing(false))}
            </Modal>

            <ConfirmDialog
                isOpen={removing}
                onOpenChange={setRemoving}
                title={`${remove.label} ${name}?`}
                description={remove.description}
                confirmLabel={remove.label}
                isPending={remove.mutation.loading}
                error={errorCopy(remove.mutation.error)}
                onConfirm={() => { void remove.mutation.run().then(() => setRemoving(false), () => undefined); }}
            />
        </>
    );
};

export default RecordActions;
