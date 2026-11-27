import ProviderModelHeader from '@sentinel/ui/components/ProviderModelHeader';
import ProviderModelRow from '@sentinel/ui/components/ProviderModelRow';
import { blankRoute, ModelRoute } from '@/modules/tower/utils/model-routes';
import { Button, Fieldset, Label } from '@heroui/react';
import { Plus, RefreshCw } from 'lucide-react';

interface ModelRoutesDetect{
    isPending: boolean;
    isReady: boolean;
    onDetect: () => void;
}

interface ModelRoutesEditorProps{
    routes: ModelRoute[];
    detect: ModelRoutesDetect;
    onChange: (routes: ModelRoute[]) => void;
}

const ModelRoutesEditor = ({ routes, detect, onChange }: ModelRoutesEditorProps) => {
    const replace = (index: number, patch: Partial<ModelRoute>) => {
        onChange(routes.map((route, at) => {
            if(at !== index) return route;

            const renamed = patch.model !== undefined && patch.model.id !== route.model.id;
            return { ...route, ...patch, ...(renamed ? { upstreamId: '' } : {}) };
        }));
    };

    return (
        <Fieldset className='flex min-w-0 flex-col gap-2'>
            <Fieldset.Legend className='flex w-full items-center justify-between gap-3'>
                <Label>Models</Label>

                <span className='flex shrink-0 items-center gap-1'>
                    <Button
                        size='sm'
                        variant='ghost'
                        isDisabled={!detect.isReady}
                        isPending={detect.isPending}
                        onPress={detect.onDetect}
                    >
                        <RefreshCw className='size-4' />
                        Detect
                    </Button>

                    <Button size='sm' variant='ghost' onPress={() => onChange([...routes, blankRoute()])}>
                        <Plus className='size-4' />
                        Add a model
                    </Button>
                </span>
            </Fieldset.Legend>

            <div className='flex flex-col gap-1.5 overflow-x-auto'>
                <ProviderModelHeader />

                <Fieldset.Group className='flex flex-col gap-1.5'>
                    {routes.map((route, index) => (
                        <ProviderModelRow
                            key={route.model.id === '' ? `blank-${index}` : route.model.id}
                            model={route.model}
                            upstreamId={route.upstreamId}
                            position={index + 1}
                            canRemove={routes.length > 1}
                            onChange={(model) => replace(index, { model })}
                            onUpstreamIdChange={(upstreamId) => replace(index, { upstreamId })}
                            onRemove={() => onChange(routes.filter((_, at) => at !== index))}
                        />
                    ))}
                </Fieldset.Group>
            </div>
        </Fieldset>
    );
};

export default ModelRoutesEditor;
