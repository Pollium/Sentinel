import typia from 'typia';
import CopyOnce from '@sentinel/ui/components/CopyOnce';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import Modal from '@sentinel/ui/components/Modal';
import { CreatedInvitation } from '@sentinel/contracts/invitations/domain';
import { InviteInput } from '@sentinel/contracts/invitations/http';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { formatDate } from '@sentinel/ui/utils/format/format-date';
import { operatorsApi } from '@/modules/operators/api/api';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { Button } from '@heroui/react';
import { useState } from 'react';

const validate = typia.createValidate<InviteInput>();

const JOIN_HINT = 'You get a link to send them. They choose their own name and password.';
const RESET_HINT = 'They already joined. The link resets their password and signs them out everywhere.';

interface InviteFormProps{
    joinedEmails: string[];
    onInvited: () => void;
}

const InviteForm = ({ joinedEmails, onInvited }: InviteFormProps) => {
    const [created, setCreated] = useState<CreatedInvitation | null>(null);
    const form = useForm<InviteInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { email: '' },
        onSubmit: async (values) => {
            setCreated(await operatorsApi.invite(values));
            form.reset();
            onInvited();
        }
    });
    const resets = joinedEmails.includes(form.values.email.toLowerCase());

    return (
        <>
            <Form form={form} className='flex flex-col gap-3 px-3'>
                <Field
                    form={form}
                    name='email'
                    label='Invite an operator'
                    description={resets ? RESET_HINT : JOIN_HINT}
                    type='email'
                    placeholder='Email'
                    autoComplete='off'
                />

                <div className='flex justify-end'>
                    <Button type='submit' isPending={form.submitting}>Create link</Button>
                </div>
            </Form>

            <Modal isOpen={created !== null} onOpenChange={(isOpen) => { if(!isOpen) setCreated(null); }} title='Copy the link now'>
                {created === null ? null : (
                    <CopyOnce
                        value={created.url}
                        description={`Send it to ${created.invitation.email}. Sentinel shows it only this once, and it works until ${formatDate(created.invitation.expiresAt)}.`}
                        copyLabel='Copy the link'
                        errorCopy={errorCopy}
                        onDone={() => setCreated(null)}
                    />
                )}
            </Modal>
        </>
    );
};

export default InviteForm;
