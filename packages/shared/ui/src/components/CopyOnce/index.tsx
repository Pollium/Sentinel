import { useCopy } from '../../hooks/chrome/use-copy';
import { ErrorCopy } from '@pollium/readable-react/errors/copy';
import { Button } from '@heroui/react';

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
            <div className='flex items-center gap-2 rounded-[7px] border border-line-strong bg-canvas py-1.5 pl-3 pr-1.5'>
                <code className='min-w-0 flex-1 break-all font-mono text-[0.8125rem] text-foreground'>{value}</code>
                <Button size='sm' variant='outline' aria-label={copyLabel} onPress={() => { void copy(); }}>{copied ? 'Copied' : 'Copy'}</Button>
            </div>

            <p className='text-muted'>{description}</p>

            <Button className='self-end' onPress={onDone}>Done</Button>
        </div>
    );
};

export default CopyOnce;
