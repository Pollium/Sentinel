import { ListBox, ListBoxItem, Select } from '@heroui/react';

export interface SelectOption<T extends string = string>{
    id: T;
    label: string;
}

interface SelectFieldProps<T extends string>{
    label: string;
    value: T;
    options: readonly SelectOption<T>[];
    onChange: (value: T) => void;
}

const SelectField = <T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) => (
    <Select
        aria-label={label}
        value={value}
        onChange={(key) => {
            const picked = options.find((option) => option.id === key);
            if(picked !== undefined) onChange(picked.id);
        }}
        fullWidth
    >
        <Select.Trigger className='h-8 border-0 bg-foreground/[0.04] px-2 text-[0.8125rem] shadow-none hover:bg-foreground/[0.07] focus:bg-foreground/[0.09]'>
            <Select.Value />
            <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
            <ListBox className='max-h-56 overflow-y-auto p-1.5'>
                {options.map((option) => (
                    <ListBoxItem key={option.id} id={option.id} textValue={option.label} className='rounded-full'>
                        {option.label}
                    </ListBoxItem>
                ))}
            </ListBox>
        </Select.Popover>
    </Select>
);

export default SelectField;
