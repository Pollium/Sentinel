import typia from 'typia';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import { UpdateProfileInput } from '@sentinel/contracts/auth/http';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { errorCopy } from '@/modules/auth/utils/error-copy';
import { Button } from '@heroui/react';

const validate = typia.createValidate<UpdateProfileInput>();

interface NameFormProps{
    name: string;
    onSaved: () => void;
}

const NameForm = ({ name, onSaved }: NameFormProps) => {
    const update = useMutation(authRoutes.updateProfile);
    const form = useForm<UpdateProfileInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { name },
        onSubmit: async (values) => {
            await update.run({ body: values });
            onSaved();
        }
    });

    return (
        <Form form={form} className='flex flex-col gap-4'>
            <Field form={form} name='name' label='Name' autoComplete='name' />

            <Button type='submit' className='self-end' isPending={form.submitting}>Save changes</Button>
        </Form>
    );
};

export default NameForm;
