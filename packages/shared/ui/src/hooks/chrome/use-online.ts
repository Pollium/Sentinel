import { useSyncExternalStore } from 'react';

const subscribe = (notify: () => void) => {
    addEventListener('online', notify);
    addEventListener('offline', notify);

    return () => {
        removeEventListener('online', notify);
        removeEventListener('offline', notify);
    };
};

export const useOnline = (): boolean =>
    useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
