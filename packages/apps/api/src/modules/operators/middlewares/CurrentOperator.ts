import { AuthError } from '@readable/auth/errors';
import { createParamDecorator } from '@readable/decorators/controllers/Params';

export const CurrentOperator = (): ParameterDecorator =>
    createParamDecorator((req) => {
        if(req.operator === undefined) throw AuthError.Unauthorized();

        return req.operator;
    });
