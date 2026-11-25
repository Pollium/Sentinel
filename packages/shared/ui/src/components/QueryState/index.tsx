import ErrorState from '../ErrorState';
import RefreshFailed from '../RefreshFailed';
import { QueryState as States, QueryStateProps as StatesProps } from '@pollium/readable-react/states/QueryState';
import { ReactNode } from 'react';

interface QueryStateProps<T>{
    query: StatesProps<T>['query'];
    skeleton: ReactNode;
    errorTitle: string;
    errorDescription: string | null;
    empty?: ReactNode;
    children: (data: T) => ReactNode;
}

const QueryState = <T,>({
    query,
    skeleton,
    errorTitle,
    errorDescription,
    empty,
    children
}: QueryStateProps<T>) => (
    <States
        query={query}
        loading={skeleton}
        failed={(_error, retry) => <ErrorState title={errorTitle} description={errorDescription} onRetry={retry} />}
        stale={(_error, retry) => <RefreshFailed onRetry={retry} />}
        empty={empty}
    >
        {children}
    </States>
);

export default QueryState;
