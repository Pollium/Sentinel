import typia from 'typia';
import ModelRoutesEditor from '@/modules/tower/components/ModelRoutesEditor';
import Field from '@sentinel/ui/components/Field';
import Form from '@sentinel/ui/components/Form';
import InlineError from '@sentinel/ui/components/InlineError';
import SwitchField from '@sentinel/ui/components/SwitchField';
import { GatewayKind, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { providerRoutes } from '@sentinel/contracts/providers/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { useForm } from '@sentinel/ui/hooks/forms/use-form';
import { NewProviderFormValues, ProviderFormValues } from '@/modules/tower/contracts/provider-form';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { blankRoute, modelMapOf, modelsOf, toRoutes, withDiscovered, ModelRoute } from '@/modules/tower/utils/model-routes';
import { Button } from '@heroui/react';

const validateNew = typia.createValidate<NewProviderFormValues>();
const validateExisting = typia.createValidate<ProviderFormValues>();

const PLACEHOLDERS: Record<GatewayKind, { baseUrl: string; apiKey: string }> = {
    chat: { baseUrl: 'https://openrouter.ai/api/v1', apiKey: 'sk-or-…' },
    voice: { baseUrl: 'https://api.deepgram.com', apiKey: 'dg-…' },
    search: { baseUrl: 'https://api.search.brave.com', apiKey: 'BSA…' }
};

const routesFrom = (kind: GatewayKind, provider: PublicGatewayProvider | null): ModelRoute[] => {
    const routes = provider === null ? [] : toRoutes(provider.models, provider.modelMap);
    return routes.length === 0 && kind === 'chat' ? [blankRoute()] : routes;
};

interface ProviderFormProps{
    kind: GatewayKind;
    provider: PublicGatewayProvider | null;
    onSaved: () => void;
}

const ProviderForm = ({ kind, provider, onSaved }: ProviderFormProps) => {
    const create = useMutation(providerRoutes.createProvider, { path: { kind } });
    const update = useMutation(providerRoutes.updateProvider, { path: { id: provider?.id }, invalidates: [providerRoutes.providers] });
    const form = useForm<ProviderFormValues>({
        validate: provider === null ? validateNew : validateExisting,
        submitErrorMessage: errorCopy,
        initialValues: {
            name: provider?.name ?? '',
            baseUrl: provider?.baseUrl ?? '',
            apiKey: '',
            isActive: provider?.isActive ?? true,
            routes: routesFrom(kind, provider)
        },
        onSubmit: async ({ apiKey, routes, ...profile }) => {
            const settled = { ...profile, models: modelsOf(routes), modelMap: modelMapOf(routes) };
            if(provider === null) await create.run({ body: { ...settled, apiKey } });
            else await update.run({ body: apiKey === '' ? settled : { ...settled, apiKey } });
            onSaved();
        }
    });
    const detect = useMutation(providerRoutes.discoverModels);
    const { baseUrl, apiKey, routes } = form.values;
    const active = form.field('isActive');
    const placeholders = PLACEHOLDERS[kind];
    const canDetect = baseUrl.trim() !== '' && (apiKey !== '' || provider !== null);
    const detectError = errorCopy(detect.error);

    const discover = () => {
        void detect
            .run({ body: { baseUrl: baseUrl.trim(), ...(apiKey === '' ? { providerId: provider?.id } : { apiKey }) } })
            .then((discovered) => {
                const merged = withDiscovered(form.values.routes, discovered.models);
                form.setValues({ routes: merged.length === 0 ? [blankRoute()] : merged });
            })
            .catch(() => undefined);
    };

    return (
        <Form form={form} className='flex flex-col gap-4'>
            <Field form={form} name='name' label='Name' placeholder='OpenRouter' />

            <Field form={form} name='baseUrl' label='Base URL' placeholder={placeholders.baseUrl} />

            <Field
                form={form}
                name='apiKey'
                label='API key'
                type='password'
                autoComplete='off'
                description={provider === null ? undefined : 'Leave blank to keep the current key.'}
                placeholder={placeholders.apiKey}
            />

            {kind === 'chat' ? (
                <ModelRoutesEditor
                    routes={routes}
                    detect={{ isPending: detect.loading, isReady: canDetect, onDetect: discover }}
                    onChange={(next) => form.setValues({ routes: next })}
                />
            ) : null}

            <SwitchField label='Active' isSelected={active.value} onChange={active.onChange} />

            {detectError === null ? null : <InlineError>{detectError}</InlineError>}

            <Button type='submit' className='self-end' isPending={form.submitting}>
                {provider === null ? 'Add provider' : 'Save changes'}
            </Button>
        </Form>
    );
};

export default ProviderForm;
