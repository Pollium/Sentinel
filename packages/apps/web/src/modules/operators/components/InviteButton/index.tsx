import CopyOnce from '@sentinel/ui/components/CopyOnce';
import InviteForm from '@/modules/operators/components/InviteForm';
import Modal from '@sentinel/ui/components/Modal';
import { CreatedInvitation } from '@sentinel/contracts/invitations/domain';
import { formatDate } from '@sentinel/ui/utils/format/format-date';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { Button } from '@heroui/react';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';

interface InviteButtonProps{
    joinedEmails: string[];
    onInvited: () => void;
}

const InviteButton = ({ joinedEmails, onInvited }: InviteButtonProps) => {
    const [isOpen, setOpen] = useState(false);
    const [created, setCreated] = useState<CreatedInvitation | null>(null);

    const close = () => {
        setOpen(false);
        setCreated(null);
    };

    return (
        <>
            <Button size='sm' variant='ghost' aria-label='Invite an operator' className='shrink-0 gap-1.5 text-muted hover:text-foreground max-sm:px-2' onPress={() => setOpen(true)}>
                <UserPlus className='size-4' aria-hidden='true' />
                <span className='hidden sm:inline'>Invite</span>
            </Button>

            <Modal isOpen={isOpen} onOpenChange={(next) => next ? setOpen(true) : close()} title={created === null ? 'Invite an operator' : 'Copy the link now'}>
                {created === null ? (
                    <InviteForm
                        joinedEmails={joinedEmails}
                        onDone={(next) => {
                            setCreated(next);
                            onInvited();
                        }}
                    />
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
