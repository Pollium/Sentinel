import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const ProviderErrors = {
    domain: 'Provider',
    causes: {
        NotFound: 404,
        ModelsNeedKey: 400,
        ModelsUnreachable: 502,
        ModelsRejected: 502
    }
} as const satisfies ErrorTable;

export type ProviderErrorCode = ErrorCode<typeof ProviderErrors>;

export const PoolErrors = {
    domain: 'Pool',
    causes: {
        NoProvider: 503,
        NoHealthyProvider: 503
    }
} as const satisfies ErrorTable;
