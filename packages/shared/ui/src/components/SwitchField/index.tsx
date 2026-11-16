import { Switch } from '@heroui/react';

interface SwitchFieldProps{
    label: string;
    isSelected: boolean;
    onChange: (isSelected: boolean) => void;
}

const SwitchField = ({ label, isSelected, onChange }: SwitchFieldProps) => (
    <Switch isSelected={isSelected} onChange={onChange}>
        <Switch.Content>
            <Switch.Control>
                <Switch.Thumb />
            </Switch.Control>

            <span className='text-[0.8125rem] text-muted'>{label}</span>
        </Switch.Content>
    </Switch>
);

export default SwitchField;
