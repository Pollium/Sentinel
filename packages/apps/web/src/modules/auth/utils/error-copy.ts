import { AuthErrors } from '@sentinel/contracts/auth/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';
import { SESSION_ENDED } from '@sentinel/ui/utils/format/app-copy';

export const errorCopy = copyFor(AuthErrors, {
    Unauthorized: SESSION_ENDED,
    InvalidToken: SESSION_ENDED,
    InvalidCredentials: 'Wrong email or password.',
    SetupClosed: 'Sentinel already has an operator. Sign in instead.',
    WrongPassword: 'That is not your current password.'
});
