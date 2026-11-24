import { defineErrors } from '@pollium/readable/app/errors';
import { InvitationErrors } from '@sentinel/contracts/invitations/errors';

export const InvitationError = defineErrors(InvitationErrors);
