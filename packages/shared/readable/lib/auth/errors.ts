import { AuthErrors } from '@sentinel/contracts/auth/errors';
import { defineErrors } from '../utils/errors/define-errors';

export const AuthError = defineErrors(AuthErrors);
