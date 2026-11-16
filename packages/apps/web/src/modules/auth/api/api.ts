import { ChangePasswordInput, SetupInput, SignInInput, UpdateProfileInput } from '@sentinel/contracts/auth/http';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { AcceptInvitationInput } from '@sentinel/contracts/invitations/http';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { call } from '@sentinel/ui/api/call';

export const authApi = {
    setupStatus: () => call(authRoutes.setupStatus),
    setup: (body: SetupInput) => call(authRoutes.setup, { body }),
    signIn: (body: SignInInput) => call(authRoutes.signIn, { body }),
    updateProfile: (body: UpdateProfileInput) => call(authRoutes.updateProfile, { body }),
    changePassword: (body: ChangePasswordInput) => call(authRoutes.changePassword, { body }),
    previewInvitation: (token: string) => call(invitationRoutes.preview, { path: { token } }),
    acceptInvitation: (token: string, body: AcceptInvitationInput) => call(invitationRoutes.accept, { path: { token }, body })
};
