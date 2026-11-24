import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const ApiKeyErrors = {
    domain: 'ApiKey',
    causes: {
        NotFound: 404,
        Unauthorized: 401
    }
} as const satisfies ErrorTable;

export type ApiKeyErrorCode = ErrorCode<typeof ApiKeyErrors>;
