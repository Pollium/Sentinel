import { useSessionStore } from '../../store/session';
import { safePath } from '../../utils/routing/safe-path';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

const GuestGuard = () => {
    const token = useSessionStore((state) => state.token);
    const [params] = useSearchParams();

    if(token !== null) return <Navigate to={safePath(params.get('next'))} replace />;

    return <Outlet />;
};

export default GuestGuard;
