import { useCopy } from '../../hooks/chrome/use-copy';
import { ErrorCopy } from '@pollium/readable-react/errors/copy';
import { Button } from '@heroui/react';
import { Check, Copy } from 'lucide-react';

interface CopyOnceProps{
    value: string;
    description: string;
    copyLabel: string;
    errorCopy: ErrorCopy;
    onDone: () => void;
}

const CopyOnce = ({ value, description, copyLabel, errorCopy, onDone }: CopyOnceProps) => {
    const { copied, copy } = useCopy(value, errorCopy);

    return (
        <div className='flex flex-col gap-4'>
            <p className='text-[0.875rem] text-muted'>{description}</p>

            <div className='flex items-center gap-2 rounded-xl bg-foreground/[0.04] p-3'>
                <code className='min-w-0 flex-1 truncate font-mono text-[0.8125rem] text-foreground'>{value}</code>

                <Button
                    isIconOnly
                    size='sm'
                    variant='ghost'
                    aria-label={copyLabel}
                    onPress={() => { void copy(); }}
                >
                    {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
                </Button>
            </div>

            <Button className='self-end' onPress={onDone}>Done</Button>
        </div>
    );
};

export default CopyOnce;
