import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const OperatorErrors = {
    domain: 'Operator',
    causes: {
        NotFound: 404,
        RemoveSelf: 409
    }
} as const satisfies ErrorTable;

export type OperatorErrorCode = ErrorCode<typeof OperatorErrors>;
