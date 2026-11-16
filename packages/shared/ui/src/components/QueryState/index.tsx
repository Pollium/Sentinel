import ErrorState from '../ErrorState';
import RefreshFailed from '../RefreshFailed';
import { Query } from '../../contracts/api';
import { ReactNode } from 'react';

interface QueryStateProps<T>{
    query: Query<T>;
    skeleton: ReactNode;
    errorTitle: string;
    errorDescription: string | null;
    isEmpty?: (data: T | null) => boolean;
    empty?: ReactNode;
    children: (data: T) => ReactNode;
}

const QueryState = <T,>({
    query,
    skeleton,
    errorTitle,
    errorDescription,
    isEmpty,
    empty,
    children
}: QueryStateProps<T>) => {
    if(query.loading && query.data === null) return skeleton;

    if(query.error && query.data === null){
        return (
            <ErrorState title={errorTitle} description={errorDescription} onRetry={query.reload} />
        );
    }

    if(isEmpty?.(query.data)) return empty ?? null;
    if(query.data === null) return null;
    if(query.error === undefined) return children(query.data);

    return (
        <>
            {children(query.data)}
            <RefreshFailed onRetry={query.reload} />
        </>
    );
};

export default QueryState;
