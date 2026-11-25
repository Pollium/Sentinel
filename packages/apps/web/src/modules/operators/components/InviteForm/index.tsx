import typia from 'typia';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import { CreatedInvitation } from '@sentinel/contracts/invitations/domain';
import { InviteInput } from '@sentinel/contracts/invitations/http';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { Button } from '@heroui/react';

const validate = typia.createValidate<InviteInput>();

const JOIN_HINT = 'You get a link to send them. They choose their own name and password.';
const RESET_HINT = 'They already joined. The link resets their password and signs them out everywhere.';

interface InviteFormProps{
    joinedEmails: string[];
    onDone: (created: CreatedInvitation) => void;
}

const InviteForm = ({ joinedEmails, onDone }: InviteFormProps) => {
    const invite = useMutation(invitationRoutes.create);
    const form = useForm<InviteInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { email: '' },
        onSubmit: async (values) => {
            onDone(await invite.run({ body: values }));
        }
    });
    const resets = joinedEmails.includes(form.values.email.toLowerCase());

    return (
        <Form form={form} className='flex flex-col gap-4'>
            <Field
                form={form}
                name='email'
                label='Email'
                description={resets ? RESET_HINT : JOIN_HINT}
                type='email'
                placeholder='Email'
                autoComplete='off'
            />

            <Button type='submit' className='self-end' isPending={form.submitting}>Create link</Button>
        </Form>
    );
};

export default InviteForm;
