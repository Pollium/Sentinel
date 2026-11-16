import { ErrorCode, ErrorTable } from '../shared/errors';

export const InvitationErrors = {
    domain: 'Invitation',
    causes: {
        NotFound: 404
    }
} as const satisfies ErrorTable;

export type InvitationErrorCode = ErrorCode<typeof InvitationErrors>;
