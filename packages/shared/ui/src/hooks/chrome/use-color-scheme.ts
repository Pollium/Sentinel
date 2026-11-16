import { useSyncExternalStore } from 'react';

const isDark = (): boolean => document.documentElement.classList.contains('dark');

export const useColorScheme = (): 'dark' | 'light' =>
    useSyncExternalStore(
        (notify) => {
            const observer = new MutationObserver(notify);
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class', 'data-theme']
            });

            return () => observer.disconnect();
        },
        () => isDark() ? 'dark' : 'light',
        () => 'light'
    );
