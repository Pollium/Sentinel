import { InvitationErrors } from '@sentinel/contracts/invitations/errors';
import { OperatorErrors } from '@sentinel/contracts/operators/errors';
import { copyFor } from '@pollium/readable-react/errors/copy';

export const errorCopy = copyFor(OperatorErrors, {
    NotFound: 'That operator no longer exists.',
    RemoveSelf: 'You cannot remove yourself. Another operator has to do it.'
}).with(copyFor(InvitationErrors, {
    NotFound: 'That invitation no longer exists.'
}));
