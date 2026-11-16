import {
    useCallback,
    useState,
    Dispatch,
    SetStateAction
} from 'react';

export const useKeyedState = <T>(key: unknown, initial: () => T): [T, Dispatch<SetStateAction<T>>] => {
    const [held, setHeld] = useState(() => ({ key, value: initial() }));

    if(held.key !== key) setHeld({ key, value: initial() });

    const set = useCallback((next: SetStateAction<T>) => {
        setHeld((current) => ({
            key: current.key,
            value: typeof next === 'function' ? (next as (previous: T) => T)(current.value) : next
        }));
    }, []);

    return [held.value, set];
};
