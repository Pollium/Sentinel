import { JumpDestination } from '../../contracts/jump';
import { useJumpShortcut } from '../../hooks/chrome/use-jump-shortcut';
import { ComboBox, Input, ListBox, ListBoxItem } from '@heroui/react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface JumpBoxProps{
    label: string;
    destinations: JumpDestination[];
    className?: string;
}

const JumpBox = ({ label, destinations, className = '' }: JumpBoxProps) => {
    const navigate = useNavigate();
    const input = useRef<HTMLInputElement>(null);
    const [text, setText] = useState('');
    useJumpShortcut(() => input.current?.focus());

    return (
        <ComboBox
            aria-label={label}
            defaultItems={destinations}
            inputValue={text}
            onInputChange={setText}
            selectedKey={null}
            onSelectionChange={(key) => {
                if(key === null) return;
                setText('');
                input.current?.blur();
                navigate(String(key));
            }}
            className={className}
            fullWidth
        >
            <ComboBox.InputGroup>
                <Input ref={input} placeholder={`${label}   ⌘K`} />
            </ComboBox.InputGroup>

            <ComboBox.Popover className='max-w-[calc(100vw_-_2rem)]'>
                <ListBox className='max-h-80 overflow-y-auto p-1.5'>
                    {(destination: JumpDestination) => (
                        <ListBoxItem id={destination.id} textValue={destination.label} className='rounded-lg'>
                            <span className='min-w-0 flex-1 truncate'>{destination.label}</span>
                            <span className='shrink-0 text-[0.75rem] text-muted'>{destination.note}</span>
                        </ListBoxItem>
                    )}
                </ListBox>
            </ComboBox.Popover>
        </ComboBox>
    );
};

export default JumpBox;
