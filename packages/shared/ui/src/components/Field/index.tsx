import { FormApi } from '../../contracts/form';
import { TextField, Label, Description, Input, FieldError } from '@heroui/react';

interface FieldProps<T extends object>{
    form: FormApi<T>;
    name: keyof T & string;
    label?: string;
    description?: string;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
}

const Field = <T extends object>({
    form,
    name,
    label,
    description,
    type = 'text',
    placeholder,
    autoComplete
}: FieldProps<T>) => {
    const binding = form.field(name);

    const text = String(binding.value ?? '');
    const onChange = (value: string) => {
        binding.onChange(value as T[keyof T & string]);
    };

    return (
        <TextField
            name={binding.name}
            type={type}
            value={text}
            onChange={onChange}
            onBlur={binding.onBlur}
            isInvalid={binding.isInvalid}
            isDisabled={form.submitting}
            validationBehavior='aria'
            fullWidth
        >
            {label ? <Label>{label}</Label> : null}
            {description ? <Description>{description}</Description> : null}
            <Input placeholder={placeholder} autoComplete={autoComplete} />
            <FieldError>{binding.errorMessage}</FieldError>
        </TextField>
    );
};

export default Field;

