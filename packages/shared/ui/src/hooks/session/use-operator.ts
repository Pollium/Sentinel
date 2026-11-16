import { authRoutes } from '@sentinel/contracts/auth/routes';
import { Operator } from '@sentinel/contracts/operators/domain';
import { call } from '../../api/call';
import { Query } from '../../contracts/api';
import { useSessionStore } from '../../store/session';
import { useQuery } from '../api/use-query';

const me = () => call(authRoutes.me);

export const useOperator = (): Query<Operator> => {
    const token = useSessionStore((state) => state.token);
    return useQuery(me, [], { enabled: token !== null });
};
