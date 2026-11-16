import typia from 'typia';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import AuthHeading from '@/modules/auth/components/AuthHeading';
import { InvitationPreview } from '@sentinel/contracts/invitations/domain';
import { AcceptInvitationInput } from '@sentinel/contracts/invitations/http';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { errorCopy } from '@/modules/auth/utils/error-copy';
import { Button } from '@heroui/react';

const validate = typia.createValidate<AcceptInvitationInput>();

interface InvitationFormProps{
    invitation: InvitationPreview;
    onAccept: (values: AcceptInvitationInput) => Promise<void>;
}

const InvitationForm = ({ invitation, onAccept }: InvitationFormProps) => {
    const resets = invitation.operatorName !== null;
    const form = useForm<AcceptInvitationInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { name: invitation.operatorName ?? '', password: '' },
        onSubmit: onAccept
    });
    const email = <span className='text-foreground'>{invitation.email}</span>;

    return (
        <>
            {resets ? (
                <AuthHeading title='Reset your password'>
                    Choose a new password for {email}. Saving it signs you out everywhere else.
                </AuthHeading>
            ) : (
                <AuthHeading title='Join Sentinel'>
                    You were invited as {email}.
                </AuthHeading>
            )}

            <Form form={form} className='flex flex-col gap-4'>
                <Field form={form} name='name' label='Name' placeholder='Name' autoComplete='name' />
                <Field
                    form={form}
                    name='password'
                    label={resets ? 'New password' : 'Password'}
                    description='Eight characters or more.'
                    type='password'
                    placeholder='Password'
                    autoComplete='new-password'
                />

                <Button type='submit' fullWidth isPending={form.submitting}>
                    {resets ? 'Reset and sign in' : 'Join and sign in'}
                </Button>
            </Form>
        </>
    );
};

export default InvitationForm;
