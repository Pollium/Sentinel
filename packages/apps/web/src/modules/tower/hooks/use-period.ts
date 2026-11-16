import { UsageWindow, usageWindowOf } from '@sentinel/contracts/usage/domain';
import { useSearchParams } from 'react-router-dom';

export const usePeriod = (): [UsageWindow, (window: UsageWindow) => void] => {
    const [searchParams, setSearchParams] = useSearchParams();

    return [
        usageWindowOf(searchParams.get('window')),
        (next) => setSearchParams((params) => {
            params.set('window', next);

            return params;
        }, { replace: true })
    ];
};
