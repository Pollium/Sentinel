import { AuthError } from '@pollium/readable/app/errors';
import { createParamDecorator } from '@pollium/readable/http/params';

export const CurrentOperator = (): ParameterDecorator =>
    createParamDecorator((req) => {
        if(req.operator === undefined) throw AuthError.Unauthorized();

        return req.operator;
    });
