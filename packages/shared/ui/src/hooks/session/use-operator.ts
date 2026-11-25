import { authRoutes } from '@sentinel/contracts/auth/routes';
import { Operator } from '@sentinel/contracts/operators/domain';
import { call } from '../../api/call';
import { Query } from '../../contracts/api';
import { useQuery } from '../api/use-query';
import { useSession } from '@pollium/readable-react/session/session';

const me = () => call(authRoutes.me);

export const useOperator = (): Query<Operator> => {
    const token = useSession();
    return useQuery(me, [], { enabled: token !== null });
};
