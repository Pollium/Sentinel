import { NumberField } from '@heroui/react';

interface ProviderNumberFieldProps{
    label: string;
    value: number | null | undefined;
    minValue: number;
    step: number;
    formatOptions: Intl.NumberFormatOptions;
    placeholder: string;
    onChange: (value: number | null) => void;
}

const ProviderNumberField = ({ label, value, minValue, step, formatOptions, placeholder, onChange }: ProviderNumberFieldProps) => (
    <NumberField
        aria-label={label}
        value={value ?? Number.NaN}
        minValue={minValue}
        step={step}
        formatOptions={formatOptions}
        onChange={(next) => onChange(Number.isNaN(next) ? null : next)}
        fullWidth
    >
        <NumberField.Group className='h-8 border-0 bg-foreground/[0.04] shadow-none hover:bg-foreground/[0.07] focus-within:bg-foreground/[0.09]'>
            <NumberField.Input className='col-span-3 px-2 text-[0.8125rem]' placeholder={placeholder} />
        </NumberField.Group>
    </NumberField>
);

export default ProviderNumberField;
