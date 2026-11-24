import { ApiKeyErrorCode } from '@sentinel/contracts/keys/errors';
import { ProviderErrorCode } from '@sentinel/contracts/providers/errors';
import { RequestErrorCode } from '@pollium/readable-contracts/errors';
import { ClipboardErrorCode } from '@sentinel/ui/services/clipboard';
import { lookupError } from '@sentinel/ui/utils/format/lookup-error';
import { SHARED_ERROR_COPY } from '@sentinel/ui/utils/format/shared-error-copy';

type CopiedCode = ProviderErrorCode | ApiKeyErrorCode | RequestErrorCode | ClipboardErrorCode;

export const errorCopy = lookupError<CopiedCode>({
    ...SHARED_ERROR_COPY,
    'Provider::NotFound': 'This provider no longer exists.',
    'ApiKey::NotFound': 'This key no longer exists.',
    'Provider::ModelsNeedKey': 'Type the API key first — the upstream will not list its models without one.',
    'Provider::ModelsUnreachable': 'That base URL did not answer. Check it and try again.',
    'Provider::ModelsRejected': 'The upstream refused to list its models. Check the base URL and the key.'
});
