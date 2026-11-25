import { AppCopy } from '@pollium/readable-react/errors/copy';

export const SESSION_ENDED = 'Your session ended. Sign in again.';

export const appCopy: AppCopy = {
    offline: 'Network request failed',
    unknown: 'Something went wrong. Try again in a moment.',
    codes: {
        'Auth::Unauthorized': SESSION_ENDED,
        'Auth::InvalidToken': SESSION_ENDED,
        'RateLimit::TooManyRequests': 'Too many attempts. Wait a minute and try again.',
        'Request::InvalidId': 'That id is not valid.',
        'Request::InvalidPagination': 'That page of the list is not valid.',
        'Request::FileMissing': 'Choose a file first.',
        'Request::FileTooLarge': 'That file is too large.',
        'Request::ValidationFailed': 'Review the form — some fields are missing or invalid.',
        'Server::Internal': 'Something went wrong on our side. Try again in a moment.',
        'Clipboard::WriteBlocked': 'Your browser is not letting us use the clipboard. Copy it by hand.'
    }
};
