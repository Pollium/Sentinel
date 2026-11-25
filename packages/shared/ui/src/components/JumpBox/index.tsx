import { JumpDestination } from '../../contracts/jump';
import { useJumpShortcut } from '../../hooks/chrome/use-jump-shortcut';
import { ComboBox, Input, ListBox, ListBoxItem } from '@heroui/react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface JumpBoxProps{
    label: string;
    destinations: JumpDestination[];
}

const JumpBox = ({ label, destinations }: JumpBoxProps) => {
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
                void navigate(String(key));
            }}
            fullWidth
        >
            <ComboBox.InputGroup className='relative'>
                <Input
                    ref={input}
                    placeholder='Search'
                    className='h-7 rounded-md border-0 bg-transparent px-2 pr-11 text-[0.8125rem] shadow-none hover:bg-selected focus:bg-selected'
                />
                <kbd aria-hidden='true' className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line-strong px-1.5 font-mono text-[0.6875rem] leading-[1.125rem] text-subtle'>⌘K</kbd>
            </ComboBox.InputGroup>

            <ComboBox.Popover className='max-w-[calc(100vw_-_2rem)]'>
                <ListBox className='max-h-80 overflow-y-auto p-1'>
                    {(destination: JumpDestination) => (
                        <ListBoxItem id={destination.id} textValue={destination.label} className='rounded-md'>
                            <span className='min-w-0 flex-1 truncate'>{destination.label}</span>
                            <span className='shrink-0 text-[0.75rem] text-subtle'>{destination.note}</span>
                        </ListBoxItem>
                    )}
                </ListBox>
            </ComboBox.Popover>
        </ComboBox>
    );
};

export default JumpBox;
