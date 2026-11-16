import ActionMenu from '@sentinel/ui/components/ActionMenu';
import ConfirmDialog from '@sentinel/ui/components/ConfirmDialog';
import { Invitation } from '@sentinel/contracts/invitations/domain';
import { useMutation } from '@sentinel/ui/hooks/api/use-mutation';
import { operatorsApi } from '@/modules/operators/api/api';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { DropdownItem } from '@heroui/react';
import { useState } from 'react';

interface InvitationActionsProps{
    invitation: Invitation;
    onRevoked: () => void;
}

const InvitationActions = ({ invitation, onRevoked }: InvitationActionsProps) => {
    const [confirming, setConfirming] = useState(false);
    const revoke = useMutation(operatorsApi.revoke, {
        onSuccess: () => {
            setConfirming(false);
            onRevoked();
        }
    });

    return (
        <>
            <ActionMenu subject={invitation.email}>
                <DropdownItem variant='danger' onAction={() => setConfirming(true)}>
                    Revoke invitation
                </DropdownItem>
            </ActionMenu>

            <ConfirmDialog
                isOpen={confirming}
                onOpenChange={setConfirming}
                title='Revoke invitation'
                description={`The link sent to ${invitation.email} stops working.`}
                confirmLabel='Revoke'
                isPending={revoke.loading}
                error={errorCopy(revoke.error)}
                onConfirm={() => { void revoke.run(invitation.id).catch(() => undefined); }}
            />
        </>
    );
};

export default InvitationActions;
