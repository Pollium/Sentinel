import { principalId } from '@pollium/readable/auth/params';
import { SocketAuthenticatedRoute } from '@pollium/readable/auth/guards';
import { MiddlewareFn } from '@pollium/readable/http/middleware';
import { operatorOf } from './OperatorRoute';

export const OperatorSocketRoute: MiddlewareFn = async (req, reply) => {
    await SocketAuthenticatedRoute(req, reply);
    req.operator = await operatorOf(principalId(req));
};
