import { useEffect, useRef } from 'react';

export const useJumpShortcut = (onJump: () => void) => {
    const latest = useRef(onJump);
    latest.current = onJump;

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if(event.key !== 'k' && event.key !== 'K') return;
            if(!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey || event.repeat) return;

            event.preventDefault();
            latest.current();
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);
};
