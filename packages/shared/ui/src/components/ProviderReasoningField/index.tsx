import SelectField, { SelectOption } from '../SelectField';
import { ProviderModel, ReasoningEffort } from '@sentinel/contracts/providers/domain';

type ReasoningChoice = 'off' | ReasoningEffort | 'thinking';

type ReasoningPatch = Pick<ProviderModel, 'reasoning' | 'reasoningDefault'>;

interface ProviderReasoningFieldProps{
    label: string;
    model: ProviderModel;
    onChange: (patch: ReasoningPatch) => void;
}

const CHOICES: readonly SelectOption<ReasoningChoice>[] = [
    { id: 'off', label: 'Off' },
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
    { id: 'thinking', label: 'Thinking' }
];

const choiceOf = (model: ProviderModel): ReasoningChoice => {
    if(model.reasoning === 'thinking') return 'thinking';
    if(model.reasoning === 'effort') return model.reasoningDefault ?? 'medium';
    return 'off';
};

const patchOf = (choice: ReasoningChoice): ReasoningPatch => {
    if(choice === 'off') return { reasoning: 'none', reasoningDefault: null };
    if(choice === 'thinking') return { reasoning: 'thinking', reasoningDefault: null };
    return { reasoning: 'effort', reasoningDefault: choice };
};

const ProviderReasoningField = ({ label, model, onChange }: ProviderReasoningFieldProps) => (
    <SelectField
        label={label}
        value={choiceOf(model)}
        options={CHOICES}
        onChange={(choice) => onChange(patchOf(choice))}
    />
);

export default ProviderReasoningField;
