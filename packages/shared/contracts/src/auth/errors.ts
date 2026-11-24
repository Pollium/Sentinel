import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const AuthErrors = {
    domain: 'Auth',
    causes: {
        Unauthorized: 401,
        InvalidToken: 401,
        InvalidCredentials: 401,
        SetupClosed: 409,
        WrongPassword: 400
    }
} as const satisfies ErrorTable;

export type AuthErrorCode = ErrorCode<typeof AuthErrors>;
