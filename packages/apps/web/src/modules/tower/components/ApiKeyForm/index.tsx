import typia from 'typia';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import SwitchField from '@sentinel/ui/components/SwitchField';
import { IssuedGatewayApiKey, PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { CreateApiKeyInput } from '@sentinel/contracts/keys/http';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { towerApi } from '@/modules/tower/api/api';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { Button } from '@heroui/react';

const validate = typia.createValidate<CreateApiKeyInput>();

interface ApiKeyFormProps{
    apiKey: PublicGatewayApiKey | null;
    onDone: (issued: IssuedGatewayApiKey | null) => void;
}

const ApiKeyForm = ({ apiKey, onDone }: ApiKeyFormProps) => {
    const form = useForm<CreateApiKeyInput>({
        validate,
        submitErrorMessage: errorCopy,
        initialValues: { name: apiKey?.name ?? '', isActive: apiKey?.isActive ?? true },
        onSubmit: async (values) => {
            if(apiKey === null){
                onDone(await towerApi.createKey(values));
                return;
            }

            await towerApi.updateKey(apiKey.id, values);
            onDone(null);
        }
    });
    const active = form.field('isActive');

    return (
        <Form form={form} className='flex flex-col gap-4'>
            <Field
                form={form}
                name='name'
                label='Name'
                description='Who holds this key. The dashboard reports usage under it.'
                placeholder='Mobile app'
            />

            <SwitchField label='Active' isSelected={active.value} onChange={active.onChange} />

            <Button type='submit' className='self-end' isPending={form.submitting}>
                {apiKey === null ? 'Issue key' : 'Save changes'}
            </Button>
        </Form>
    );
};

export default ApiKeyForm;
