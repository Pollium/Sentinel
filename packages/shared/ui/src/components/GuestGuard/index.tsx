import { safePath } from '../../utils/routing/safe-path';
import { useSession } from '@pollium/readable-react/session/session';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

const GuestGuard = () => {
    const token = useSession();
    const [params] = useSearchParams();

    if(token !== null) return <Navigate to={safePath(params.get('next'))} replace />;

    return <Outlet />;
};

export default GuestGuard;
