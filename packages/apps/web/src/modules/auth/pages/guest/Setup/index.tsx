import typia from 'typia';
import AuthShell from '@sentinel/ui/components/AuthShell';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import AuthHeading from '@/modules/auth/components/AuthHeading';
import { SetupInput } from '@sentinel/contracts/auth/http';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { call } from '@pollium/readable-react/http/call';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { session } from '@pollium/readable-react/session/session';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { errorCopy } from '@/modules/auth/utils/error-copy';
import { Button } from '@heroui/react';
import { Navigate } from 'react-router-dom';

const validate = typia.createValidate<SetupInput>();

const Setup = () => {
    const status = useQuery(authRoutes.setupStatus);
    const form = useForm<SetupInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { name: '', email: '', password: '' },
        onSubmit: async (values) => {
            const { token } = await call(authRoutes.setup, { body: values });
            session.start(token);
        }
    });

    if(status.data?.needsOwner === false) return <Navigate to='/sign-in' replace />;

    return (
        <AuthShell>
            <AuthHeading title='Set up Sentinel'>
                Create the first operator. Others join by invitation.
            </AuthHeading>

            <Form form={form} className='flex flex-col gap-4'>
                <Field form={form} name='name' label='Name' placeholder='Name' autoComplete='name' />
                <Field form={form} name='email' label='Email' type='email' placeholder='Email' autoComplete='email' />
                <Field
                    form={form}
                    name='password'
                    label='Password'
                    description='Eight characters or more.'
                    type='password'
                    placeholder='Password'
                    autoComplete='new-password'
                />

                <Button type='submit' fullWidth isPending={form.submitting}>Create and sign in</Button>
            </Form>
        </AuthShell>
    );
};

export default Setup;
