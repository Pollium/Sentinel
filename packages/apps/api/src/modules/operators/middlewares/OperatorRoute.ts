import Operator from '../models/Operator';
import { bearerPrincipal } from '@pollium/readable/auth/guards';
import { AuthError } from '@pollium/readable/app/errors';
import { MiddlewareFn } from '@pollium/readable/http/middleware';
import { findOrThrow } from '@pollium/readable/database/queries';

export const OperatorRoute: MiddlewareFn = async (req) => {
    const principal = await bearerPrincipal(req);
    if(principal === null) throw AuthError.Unauthorized();

    req.operator = await operatorOf(principal.userId);
};

export const operatorOf = (operatorId: string): Promise<Operator> =>
    findOrThrow(Operator, { id: operatorId }, AuthError.Unauthorized);
