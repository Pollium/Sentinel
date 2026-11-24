import { defineErrors } from '@pollium/readable/app/errors';
import { AuthErrors } from '@sentinel/contracts/auth/errors';

export const AuthError = defineErrors(AuthErrors);
