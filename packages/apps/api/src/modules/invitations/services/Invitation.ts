import Invitation from '../models/Invitation';
import Operator from '@/modules/operators/models/Operator';
import SessionService from '@/modules/auth/services/Session';
import PasswordService from '@readable/auth/PasswordService';
import { sessionCutoffs } from '@readable/auth/verifiedSession';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { InvitationPreview } from '@sentinel/contracts/invitations/domain';
import { AcceptInvitationInput, InviteInput } from '@sentinel/contracts/invitations/http';
import { Session } from '@/modules/auth/contracts/domain/session';
import { InvitationError } from '../contracts/domain/errors';
import { CreatedInvitation } from '../contracts/domain/invitation';
import { config } from '@/shared/config';
import { hashOf } from '@/modules/keys/utils/key-secret';
import { randomBytes } from 'node:crypto';
import { MoreThan } from 'typeorm';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_BYTES = 32;

const unexpired = () => MoreThan(new Date());

export default class InvitationService{
    #password = new PasswordService();
    #session = new SessionService();

    pending(): Promise<Invitation[]>{
        return Invitation.find({
            where: { expiresAt: unexpired() },
            order: { createdAt: 'DESC' }
        });
    }

    async create(input: InviteInput): Promise<CreatedInvitation>{
        const email = input.email.toLowerCase();
        const token = randomBytes(TOKEN_BYTES).toString('base64url');

        await Invitation.delete({ email });
        const invitation = await Invitation.create({
            email,
            tokenHash: hashOf(token),
            expiresAt: new Date(Date.now() + INVITATION_TTL_MS)
        }).save();

        return {
            invitation,
            url: `${config.webUrl}/invitations/${token}`
        };
    }

    async revoke(invitationId: string){
        const invitation = await findOrThrow(Invitation, { id: invitationId }, InvitationError.NotFound);
        await invitation.remove();
    }

    async preview(token: string): Promise<InvitationPreview>{
        const invitation = await findOrThrow(Invitation, { tokenHash: hashOf(token), expiresAt: unexpired() }, InvitationError.NotFound);
        const operator = await Operator.findOneBy({ email: invitation.email });

        return {
            email: invitation.email,
            expiresAt: invitation.expiresAt.toISOString(),
            operatorName: operator?.name ?? null
        };
    }

    async accept(token: string, input: AcceptInvitationInput): Promise<Session>{
        const passwordHash = await this.#password.hash(input.password);

        const operator = await Invitation.getRepository().manager.transaction(async (manager) => {
            const invitation = await manager.findOneBy(Invitation, { tokenHash: hashOf(token), expiresAt: unexpired() });
            if(invitation === null) throw InvitationError.NotFound();

            await manager.remove(invitation);
            const enrolled = await manager.findOneBy(Operator, { email: invitation.email })
                ?? Operator.create({ email: invitation.email, lastSignInAt: null });
            enrolled.name = input.name;
            enrolled.passwordHash = passwordHash;

            return manager.save(enrolled);
        });

        await sessionCutoffs.cut(operator.id);
        return this.#session.open(operator);
    }
}
