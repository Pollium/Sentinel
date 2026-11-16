import { principalId } from '@readable/auth/principalId';
import { SocketAuthenticatedRoute } from '@readable/auth/SocketAuthenticatedRoute';
import { MiddlewareFn } from '@readable/decorators/middleware/Middleware';
import { operatorOf } from './OperatorRoute';

export const OperatorSocketRoute: MiddlewareFn = async (req, reply) => {
    await SocketAuthenticatedRoute(req, reply);
    req.operator = await operatorOf(principalId(req));
};
