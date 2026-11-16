import { BaseEntity } from '../shared/base';

export interface Invitation extends BaseEntity{
    email: string;
    expiresAt: string;
}

export interface CreatedInvitation{
    invitation: Invitation;
    url: string;
}

export interface InvitationPreview{
    email: string;
    expiresAt: string;
    operatorName: string | null;
}
