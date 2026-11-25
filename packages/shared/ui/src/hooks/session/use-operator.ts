import { authRoutes } from '@sentinel/contracts/auth/routes';
import { Operator } from '@sentinel/contracts/operators/domain';
import { Query, useQuery } from '@pollium/readable-react/query/useQuery';
import { useSession } from '@pollium/readable-react/session/session';

export const useOperator = (): Query<Operator> => {
    const token = useSession();
    return useQuery(authRoutes.me, {}, { enabled: token !== null });
};
