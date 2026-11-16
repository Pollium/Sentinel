import { defineErrors } from '@readable/utils/errors/define-errors';
import { InvitationErrors } from '@sentinel/contracts/invitations/errors';

export const InvitationError = defineErrors(InvitationErrors);
