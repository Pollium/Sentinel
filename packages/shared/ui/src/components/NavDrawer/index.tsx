import { ScrollShadow } from '@heroui/react';
import { X } from 'lucide-react';
import { ReactNode, useEffect, useRef } from 'react';

interface NavDrawerProps{
    title: string;
    onClose: () => void;
    children: ReactNode;
}

const NavDrawer = ({ title, onClose, children }: NavDrawerProps) => {
    const dialog = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        dialog.current?.focus();
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if(event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className='fixed inset-0 z-50 flex lg:hidden'>
            <button
                type='button'
                aria-label='Close navigation'
                onClick={onClose}
                className='nav-drawer__backdrop absolute inset-0 bg-background/80'
            />

            <div
                ref={dialog}
                role='dialog'
                aria-modal='true'
                tabIndex={-1}
                aria-label='Navigation'
                className='nav-drawer__panel glass-surface relative flex h-full w-[17rem] max-w-[85vw] flex-col bg-[var(--dashboard-surface)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] focus:outline-none'
            >
                <div className='flex shrink-0 items-center justify-between pl-2'>
                    <span className='text-[0.875rem] font-medium text-foreground'>{title}</span>

                    <button
                        type='button'
                        aria-label='Close navigation'
                        onClick={onClose}
                        className='flex size-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none'
                    >
                        <X className='size-[18px]' aria-hidden='true' />
                    </button>
                </div>

                <ScrollShadow hideScrollBar className='mt-2 flex min-h-0 flex-1 flex-col'>
                    <div className='grid flex-1'>
                        {children}
                    </div>
                </ScrollShadow>
            </div>
        </div>
    );
};

export default NavDrawer;
