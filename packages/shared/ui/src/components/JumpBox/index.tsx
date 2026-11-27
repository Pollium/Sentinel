import { JumpDestination } from '../../contracts/jump';
import { useJumpShortcut } from '../../hooks/chrome/use-jump-shortcut';
import { ComboBox, Input, Kbd, ListBox, ListBoxItem } from '@heroui/react';
import { Search } from 'lucide-react';
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
            <ComboBox.InputGroup className='relative'>
                <Search aria-hidden='true' className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted' />
                <Input ref={input} placeholder={label} className='bg-transparent pl-9 pr-16' />
                <span aria-hidden='true' className='pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 gap-1'>
                    <Kbd className='h-5 min-w-5 justify-center px-1 text-[0.6875rem]'><Kbd.Abbr keyValue='command' /></Kbd>
                    <Kbd className='h-5 min-w-5 justify-center px-1 text-[0.6875rem]'>K</Kbd>
                </span>
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
