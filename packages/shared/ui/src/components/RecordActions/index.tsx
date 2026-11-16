import ActionMenu from '../ActionMenu';
import ConfirmDialog from '../ConfirmDialog';
import Modal from '../Modal';
import { ErrorCopy } from '../../contracts/errors';
import { useMutation } from '../../hooks/api/use-mutation';
import { notifyWith } from '../../services/notify';
import { DropdownItem } from '@heroui/react';
import { ReactNode, useState } from 'react';

interface RecordRemoval{
    label: string;
    description: string;
    run: () => PromiseLike<unknown>;
}

interface RecordActionsProps{
    name: string;
    noun: string;
    isActive: boolean;
    editTitle: string;
    editWidth?: 'default' | 'wide';
    errorCopy: ErrorCopy;
    onSetActive: (isActive: boolean) => PromiseLike<unknown>;
    remove: RecordRemoval;
    onChanged: () => void;
    renderForm: (onSaved: () => void) => ReactNode;
}

const RecordActions = ({
    name,
    noun,
    isActive,
    editTitle,
    editWidth,
    errorCopy,
    onSetActive,
    remove,
    onChanged,
    renderForm
}: RecordActionsProps) => {
    const [editing, setEditing] = useState(false);
    const [removing, setRemoving] = useState(false);

    const update = useMutation(onSetActive, { onSuccess: onChanged });
    const discard = useMutation(remove.run, {
        onSuccess: () => {
            setRemoving(false);
            onChanged();
        }
    });

    const toggleActive = () => {
        void update.run(!isActive)
            .catch(notifyWith(errorCopy, {
                title: isActive ? `Couldn't turn off the ${noun}` : `Couldn't turn on the ${noun}`,
                retry: toggleActive
            }));
    };

    const closeForm = () => {
        setEditing(false);
        onChanged();
    };

    return (
        <>
            <ActionMenu subject={name} isDisabled={update.loading || discard.loading}>
                <DropdownItem onAction={() => setEditing(true)}>Edit</DropdownItem>
                <DropdownItem onAction={toggleActive}>{isActive ? 'Deactivate' : 'Activate'}</DropdownItem>
                <DropdownItem variant='danger' onAction={() => setRemoving(true)}>{remove.label}</DropdownItem>
            </ActionMenu>

            <Modal isOpen={editing} onOpenChange={setEditing} title={editTitle} width={editWidth}>
                {renderForm(closeForm)}
            </Modal>

            <ConfirmDialog
                isOpen={removing}
                onOpenChange={setRemoving}
                title={`${remove.label} ${name}?`}
                description={remove.description}
                confirmLabel={remove.label}
                isPending={discard.loading}
                error={errorCopy(discard.error)}
                onConfirm={() => { void discard.run().catch(() => undefined); }}
            />
        </>
    );
};

export default RecordActions;
