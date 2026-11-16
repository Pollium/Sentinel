import { useKeyedState } from '@sentinel/ui/hooks/selection/use-keyed-state';
import { useEffect } from 'react';

const hasPassed = (until: string | null): boolean => until === null || Date.parse(until) <= Date.now();

export const useCoolingDown = (until: string | null): boolean => {
    const [passed, setPassed] = useKeyedState(until, () => hasPassed(until));

    useEffect(() => {
        if(passed || until === null) return;

        const timer = setTimeout(() => setPassed(true), Date.parse(until) - Date.now());
        return () => clearTimeout(timer);
    }, [passed, until, setPassed]);

    return !passed;
};
