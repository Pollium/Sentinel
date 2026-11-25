import ActionMenu from '@sentinel/ui/components/ActionMenu';
import ConfirmDialog from '@sentinel/ui/components/ConfirmDialog';
import { Invitation } from '@sentinel/contracts/invitations/domain';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { DropdownItem } from '@heroui/react';
import { useState } from 'react';

interface InvitationActionsProps{
    invitation: Invitation;
}

const InvitationActions = ({ invitation }: InvitationActionsProps) => {
    const [confirming, setConfirming] = useState(false);
    const revoke = useMutation(invitationRoutes.revoke, {
        path: { invitationId: invitation.id },
        onSuccess: () => setConfirming(false)
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
                onConfirm={() => { void revoke.run().catch(() => undefined); }}
            />
        </>
    );
};

export default InvitationActions;
