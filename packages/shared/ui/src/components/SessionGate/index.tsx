import ErrorState from '../ErrorState';
import Loader from '../Loader';
import { useOperator } from '../../hooks/session/use-operator';
import { SessionOutlet } from '../../contracts/session';
import { useSession } from '@pollium/readable-react/session/session';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const SessionGate = () => {
    const token = useSession();
    const operator = useOperator();
    const location = useLocation();

    if(token === null){
        const next = new URLSearchParams({ next: location.pathname + location.search });
        return <Navigate to={`/sign-in?${next}`} replace />;
    }

    if(operator.error){
        return (
            <div className='flex h-dvh items-center justify-center bg-background px-4'>
                <ErrorState
                    title='Something went wrong'
                    description='We could not check your session. Try again.'
                    onRetry={operator.reload}
                />
            </div>
        );
    }

    if(operator.data === null) return <Loader label='Checking your session' className='h-dvh bg-canvas' />;

    return <Outlet context={{ operator: operator.data } satisfies SessionOutlet} />;
};

export default SessionGate;
