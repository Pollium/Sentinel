import { Session } from '../auth/domain';
import { del, get, post } from '@pollium/readable-contracts/routing';
import { CreatedInvitation, Invitation, InvitationPreview } from './domain';
import { AcceptInvitationInput, InviteInput } from './http';

export const invitationRoutes = {
    list: get<Invitation[]>('/tower/invitations'),
    create: post<InviteInput, CreatedInvitation>('/tower/invitations'),
    revoke: del('/tower/invitations/:invitationId'),
    preview: get<InvitationPreview>('/tower/invitations/accept/:token'),
    accept: post<AcceptInvitationInput, Session>('/tower/invitations/accept/:token')
};
