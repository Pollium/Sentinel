import typia from 'typia';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import { ChangePasswordInput } from '@sentinel/contracts/auth/http';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { call } from '@pollium/readable-react/http/call';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { session } from '@pollium/readable-react/session/session';
import { errorCopy } from '@/modules/auth/utils/error-copy';
import { Button } from '@heroui/react';

const validate = typia.createValidate<ChangePasswordInput>();

interface PasswordFormProps{
    onChanged: () => void;
}

const PasswordForm = ({ onChanged }: PasswordFormProps) => {
    const form = useForm<ChangePasswordInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { currentPassword: '', newPassword: '' },
        onSubmit: async (values) => {
            const { token } = await call(authRoutes.changePassword, { body: values });
            session.start(token);
            onChanged();
        }
    });

    return (
        <Form form={form} className='flex flex-col gap-4'>
            <Field
                form={form}
                name='currentPassword'
                label='Current password'
                type='password'
                autoComplete='current-password'
            />

            <Field
                form={form}
                name='newPassword'
                label='New password'
                description='Eight characters or more. Saving it signs you out everywhere else.'
                type='password'
                autoComplete='new-password'
            />

            <Button type='submit' className='self-end' isPending={form.submitting}>Change password</Button>
        </Form>
    );
};

export default PasswordForm;
