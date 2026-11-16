import ProviderNumberField from '../ProviderNumberField';
import ProviderReasoningField from '../ProviderReasoningField';
import { ProviderModel } from '@sentinel/contracts/providers/domain';
import { MODEL_GRID } from '../../utils/format/provider-models';
import { Button, Input, TextField } from '@heroui/react';
import { X } from 'lucide-react';

const PRICE = {
    minValue: 0,
    step: 0.01,
    formatOptions: { maximumFractionDigits: 6 },
    placeholder: '—'
};

const CONTEXT = {
    minValue: 1024,
    step: 1024,
    formatOptions: { maximumFractionDigits: 0, useGrouping: false },
    placeholder: '128000'
};

interface ProviderModelRowProps{
    model: ProviderModel;
    upstreamId: string;
    position: number;
    canRemove: boolean;
    onChange: (model: ProviderModel) => void;
    onUpstreamIdChange: (upstreamId: string) => void;
    onRemove: () => void;
}

const ProviderModelRow = ({ model, upstreamId, position, canRemove, onChange, onUpstreamIdChange, onRemove }: ProviderModelRowProps) => (
    <div className={MODEL_GRID}>
        <TextField
            aria-label={`Model ${position} id`}
            value={model.id}
            onChange={(id) => onChange({ ...model, id })}
            validationBehavior='aria'
            fullWidth
        >
            <Input className='h-8 border-0 bg-foreground/[0.04] px-2 text-[0.8125rem] font-medium shadow-none hover:bg-foreground/[0.07] focus:bg-foreground/[0.09]' placeholder='meta/llama-3.1-8b-instruct' />
        </TextField>

        <TextField
            aria-label={`Model ${position} upstream id`}
            value={upstreamId}
            onChange={onUpstreamIdChange}
            validationBehavior='aria'
            fullWidth
        >
            <Input className='h-8 border-0 bg-foreground/[0.04] px-2 text-[0.8125rem] font-medium shadow-none hover:bg-foreground/[0.07] focus:bg-foreground/[0.09]' placeholder='openai/gpt-5-mini' />
        </TextField>

        <ProviderNumberField
            {...PRICE}
            label='Input'
            value={model.inputPricePerMillion}
            onChange={(inputPricePerMillion) => onChange({ ...model, inputPricePerMillion })}
        />

        <ProviderNumberField
            {...PRICE}
            label='Cached'
            value={model.cachedInputPricePerMillion}
            onChange={(cachedInputPricePerMillion) => onChange({ ...model, cachedInputPricePerMillion })}
        />

        <ProviderNumberField
            {...PRICE}
            label='Output'
            value={model.outputPricePerMillion}
            onChange={(outputPricePerMillion) => onChange({ ...model, outputPricePerMillion })}
        />

        <ProviderReasoningField
            label='Reasoning'
            model={model}
            onChange={(patch) => onChange({ ...model, ...patch })}
        />

        <ProviderNumberField
            {...CONTEXT}
            label='Context tokens'
            value={model.contextWindow}
            onChange={(contextWindow) => onChange({ ...model, contextWindow })}
        />

        <Button
            isIconOnly
            size='sm'
            variant='ghost'
            aria-label={`Remove model ${position}`}
            isDisabled={!canRemove}
            onPress={onRemove}
        >
            <X className='size-4' />
        </Button>
    </div>
);

export default ProviderModelRow;
