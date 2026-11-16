import { InvitationErrorCode } from '@sentinel/contracts/invitations/errors';
import { OperatorErrorCode } from '@sentinel/contracts/operators/errors';
import { RequestErrorCode } from '@sentinel/contracts/shared/errors';
import { ClipboardErrorCode } from '@sentinel/ui/services/clipboard';
import { lookupError } from '@sentinel/ui/utils/format/lookup-error';
import { SHARED_ERROR_COPY } from '@sentinel/ui/utils/format/shared-error-copy';

type CopiedCode = OperatorErrorCode | InvitationErrorCode | RequestErrorCode | ClipboardErrorCode;

export const errorCopy = lookupError<CopiedCode>({
    ...SHARED_ERROR_COPY,
    'Operator::NotFound': 'That operator no longer exists.',
    'Operator::RemoveSelf': 'You cannot remove yourself. Another operator has to do it.',
    'Invitation::NotFound': 'That invitation no longer exists.'
});
