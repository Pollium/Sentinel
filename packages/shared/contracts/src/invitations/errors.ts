import { ErrorCode, ErrorTable } from '@pollium/readable-contracts/errors';

export const InvitationErrors = {
    domain: 'Invitation',
    causes: {
        NotFound: 404
    }
} as const satisfies ErrorTable;

export type InvitationErrorCode = ErrorCode<typeof InvitationErrors>;
