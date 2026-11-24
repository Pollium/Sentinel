import { AuthErrorCode } from '@sentinel/contracts/auth/errors';
import { RateLimitErrorCode, RequestErrorCode } from '@pollium/readable-contracts/errors';
import { lookupError } from '@sentinel/ui/utils/format/lookup-error';
import { SHARED_ERROR_COPY } from '@sentinel/ui/utils/format/shared-error-copy';

type CopiedCode = AuthErrorCode | RateLimitErrorCode | RequestErrorCode;

export const errorCopy = lookupError<CopiedCode>({
    ...SHARED_ERROR_COPY,
    'Auth::InvalidCredentials': 'Wrong email or password.',
    'Auth::SetupClosed': 'Sentinel already has an operator. Sign in instead.',
    'Auth::WrongPassword': 'That is not your current password.',
    'RateLimit::TooManyRequests': 'Too many attempts. Wait a minute and try again.'
});
