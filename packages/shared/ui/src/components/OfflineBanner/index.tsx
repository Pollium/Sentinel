import { useOnline } from '@pollium/readable-react/states/useOnline';

const OfflineBanner = () => {
    const isOnline = useOnline();

    return (
        <div role='status' className='pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3'>
            {isOnline ? null : (
                <p className='pointer-events-auto rounded-md border border-line-strong bg-raised px-3.5 py-2 text-foreground shadow-[var(--overlay-shadow)]'>
                    You're offline. Some actions won't work until you reconnect.
                </p>
            )}
        </div>
    );
};

export default OfflineBanner;
