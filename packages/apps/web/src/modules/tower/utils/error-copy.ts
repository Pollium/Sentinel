import { ApiKeyErrors } from '@sentinel/contracts/keys/errors';
import { ProviderErrors } from '@sentinel/contracts/providers/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';

export const errorCopy = copyFor(ProviderErrors, {
    NotFound: 'This provider no longer exists.',
    ModelsNeedKey: 'Type the API key first — the upstream will not list its models without one.',
    ModelsUnreachable: 'That base URL did not answer. Check it and try again.',
    ModelsRejected: 'The upstream refused to list its models. Check the base URL and the key.'
}).with(copyFor(ApiKeyErrors, {
    NotFound: 'This key no longer exists.',
    Unauthorized: 'That API key is not valid.'
}));
