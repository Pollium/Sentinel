import { InviteInput } from '@sentinel/contracts/invitations/http';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { call } from '@sentinel/ui/api/call';

export const operatorsApi = {
    list: () => call(operatorRoutes.list),
    remove: (operatorId: string) => call(operatorRoutes.remove, { path: { operatorId } }),
    invitations: () => call(invitationRoutes.list),
    invite: (body: InviteInput) => call(invitationRoutes.create, { body }),
    revoke: (invitationId: string) => call(invitationRoutes.revoke, { path: { invitationId } })
};
