import { useOnline } from '@pollium/readable-react/states/useOnline';
import { WifiOff } from 'lucide-react';

const OfflineBanner = () => {
    const isOnline = useOnline();

    return (
        <div role='status' className='pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3'>
            {isOnline ? null : (
                <p className='glass-surface pointer-events-auto flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-4 py-2 text-[0.8125rem] text-foreground shadow-lg'>
                    <WifiOff aria-hidden='true' className='size-4 shrink-0 text-muted' />
                    You're offline. Some actions won't work until you reconnect.
                </p>
            )}
        </div>
    );
};

export default OfflineBanner;
