import typia from 'typia';
import AuthShell from '@sentinel/ui/components/AuthShell';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import AuthHeading from '@/modules/auth/components/AuthHeading';
import { SignInInput } from '@sentinel/contracts/auth/http';
import { useQuery } from '@sentinel/ui/hooks/api/use-query';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { authApi } from '@/modules/auth/api/api';
import { errorCopy } from '@/modules/auth/utils/error-copy';
import { startSession } from '@/modules/auth/utils/start-session';
import { Button } from '@heroui/react';
import { Navigate } from 'react-router-dom';

const validate = typia.createValidate<SignInInput>();

const SignIn = () => {
    const setup = useQuery(authApi.setupStatus, []);
    const form = useForm<SignInInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { email: '', password: '' },
        onSubmit: async (values) => {
            await startSession(await authApi.signIn(values));
        }
    });

    if(setup.data?.needsOwner) return <Navigate to='/setup' replace />;

    return (
        <AuthShell>
            <AuthHeading title='Sign in to Sentinel'>
                No account yet? Ask an operator for an invitation.
            </AuthHeading>

            <Form form={form} className='flex flex-col gap-4'>
                <Field form={form} name='email' label='Email' type='email' placeholder='Email' autoComplete='email' />
                <Field form={form} name='password' label='Password' type='password' placeholder='Password' autoComplete='current-password' />

                <Button type='submit' fullWidth isPending={form.submitting}>Sign in</Button>
            </Form>
        </AuthShell>
    );
};

export default SignIn;
