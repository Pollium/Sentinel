import CopyOnce from '@sentinel/ui/components/CopyOnce';
import InviteForm from '@/modules/operators/components/InviteForm';
import Modal from '@sentinel/ui/components/Modal';
import { CreatedInvitation } from '@sentinel/contracts/invitations/domain';
import { formatDate } from '@sentinel/ui/utils/format/format-date';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { Button } from '@heroui/react';
import { useState } from 'react';

interface InviteButtonProps{
    joinedEmails: string[];
}

const InviteButton = ({ joinedEmails }: InviteButtonProps) => {
    const [isOpen, setOpen] = useState(false);
    const [created, setCreated] = useState<CreatedInvitation | null>(null);

    const close = () => {
        setOpen(false);
        setCreated(null);
    };

    return (
        <>
            <Button size='sm' variant='outline' className='shrink-0' onPress={() => setOpen(true)}>Invite</Button>

            <Modal isOpen={isOpen} onOpenChange={(next) => next ? setOpen(true) : close()} title={created === null ? 'Invite an operator' : 'Copy the link now'}>
                {created === null ? (
                    <InviteForm joinedEmails={joinedEmails} onDone={setCreated} />
                ) : (
                    <CopyOnce
                        value={created.url}
                        description={`Send it to ${created.invitation.email}. Sentinel shows it only this once, and it works until ${formatDate(created.invitation.expiresAt)}.`}
                        copyLabel='Copy the link'
                        errorCopy={errorCopy}
                        onDone={close}
                    />
                )}
            </Modal>
        </>
    );
};

export default InviteButton;
