import Operator from '../models/Operator';
import { bearerPrincipal } from '@readable/auth/bearerPrincipal';
import { AuthError } from '@readable/auth/errors';
import { MiddlewareFn } from '@readable/decorators/middleware/Middleware';
import { findOrThrow } from '@readable/utils/models/find-or-throw';

export const OperatorRoute: MiddlewareFn = async (req) => {
    const principal = await bearerPrincipal(req);
    if(principal === null) throw AuthError.Unauthorized();

    req.operator = await operatorOf(principal.userId);
};

export const operatorOf = (operatorId: string): Promise<Operator> =>
    findOrThrow(Operator, { id: operatorId }, AuthError.Unauthorized);
