import Invitation from '../models/Invitation';
import Operator from '@/modules/operators/models/Operator';
import { expectError, request } from '@pollium/readable/testing/request';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { uuid } from '@tests/uuid';
import { useApp } from '@tests/harness';
import { bearer, seedOperator, tokenIssuedEarlier } from '@tests/operators';
import { describe, expect, it } from 'vitest';

const DAY_MS = 24 * 60 * 60 * 1000;
const INVITATION_DAYS = 7;
const LINK = /^https:\/\/web\.test\/invitations\/([\w-]+)$/;
const NEWCOMER = {
    name: 'Grace Hopper',
    password: 'newcomer-password'
};

const tokenOf = (url: string): string => LINK.exec(url)?.[1] ?? '';

describe('InvitationController', () => {
    const ctx = useApp();

    const invite = async (email: string) => {
        const inviter = await seedOperator();
        const res = await request(ctx.app, invitationRoutes.create, { as: inviter.id, body: { email } });

        return {
            inviter,
            res,
            invitation: res.data().invitation,
            token: tokenOf(res.data().url)
        };
    };

    it('requires a token to invite, list or revoke', async () => {
        expectError(await request(ctx.app, invitationRoutes.list), 401, 'Auth::Unauthorized');
        expectError(await request(ctx.app, invitationRoutes.create, { body: { email: 'grace@sentinel.test' } }), 401, 'Auth::Unauthorized');
        expectError(await request(ctx.app, invitationRoutes.revoke, { params: { invitationId: uuid(9) } }), 401, 'Auth::Unauthorized');
    });

    it('invites by link, previews and accepts as a new operator who can then sign in', async () => {
        const { res, invitation, token } = await invite('Grace@Sentinel.test');
        const preview = await request(ctx.app, invitationRoutes.preview, { params: { token } });
        const accepted = await request(ctx.app, invitationRoutes.accept, { params: { token }, body: NEWCOMER });
        const signIn = await request(ctx.app, authRoutes.signIn, { body: { email: 'grace@sentinel.test', password: NEWCOMER.password } });

        expect(res.status).toBe(201);
        expect(res.data().url).toMatch(LINK);
        expect(invitation).toEqual({
            id: expect.any(String),
            email: 'grace@sentinel.test',
            expiresAt: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
        expect(preview.data()).toEqual({ email: 'grace@sentinel.test', expiresAt: invitation.expiresAt, operatorName: null });
        expect(accepted.status).toBe(201);
        expect(accepted.data().operator).toMatchObject({ email: 'grace@sentinel.test', name: NEWCOMER.name });
        expect(accepted.data().operator).not.toHaveProperty('passwordHash');
        expect(signIn.data().operator.id).toBe(accepted.data().operator.id);
    });

    it('expires an invitation seven days after it was made', async () => {
        const before = Date.now();
        const { invitation } = await invite('grace@sentinel.test');
        const expiresAt = new Date(invitation.expiresAt).getTime();

        expect(expiresAt).toBeGreaterThanOrEqual(before + INVITATION_DAYS * DAY_MS);
        expect(expiresAt).toBeLessThanOrEqual(Date.now() + INVITATION_DAYS * DAY_MS);
    });

    it('names the operator who already has the email, then resets their name and password and signs their old sessions out', async () => {
        const existing = await seedOperator({ email: 'grace@sentinel.test' });
        const old = tokenIssuedEarlier(existing.id);
        const { token } = await invite('grace@sentinel.test');

        const preview = await request(ctx.app, invitationRoutes.preview, { params: { token } });
        const accepted = await request(ctx.app, invitationRoutes.accept, { params: { token }, body: NEWCOMER });
        const signIn = await request(ctx.app, authRoutes.signIn, { body: { email: existing.email, password: NEWCOMER.password } });

        expect(preview.data().operatorName).toBe(existing.name);
        expect(accepted.data().operator).toMatchObject({ id: existing.id, name: NEWCOMER.name });
        expect(signIn.status).toBe(200);
        expect(await Operator.countBy({ email: existing.email })).toBe(1);
        expectError(await request(ctx.app, authRoutes.me, { headers: bearer(old) }), 401, 'Auth::InvalidToken');
        expect((await request(ctx.app, authRoutes.me, { headers: bearer(accepted.data().token) })).status).toBe(200);
    });

    it('closes an invitation once it is accepted', async () => {
        const { inviter, token } = await invite('grace@sentinel.test');
        await request(ctx.app, invitationRoutes.accept, { params: { token }, body: NEWCOMER });

        expectError(await request(ctx.app, invitationRoutes.preview, { params: { token } }), 404, 'Invitation::NotFound');
        expectError(await request(ctx.app, invitationRoutes.accept, { params: { token }, body: NEWCOMER }), 404, 'Invitation::NotFound');
        expect((await request(ctx.app, invitationRoutes.list, { as: inviter.id })).data()).toEqual([]);
    });

    it('stores only a hash of the token', async () => {
        const { invitation, token } = await invite('grace@sentinel.test');
        const stored = await Invitation.findOneByOrFail({ id: invitation.id });

        expect(stored.tokenHash).toMatch(/^[0-9a-f]{64}$/);
        expect(Buffer.from(token, 'base64url')).toHaveLength(32);
    });

    it('lists only the invitations that have not expired', async () => {
        const { inviter, invitation } = await invite('grace@sentinel.test');
        const stale = await request(ctx.app, invitationRoutes.create, { as: inviter.id, body: { email: 'ada@sentinel.test' } });
        await Invitation.update({ id: stale.data().invitation.id }, { expiresAt: new Date(Date.now() - DAY_MS) });

        const res = await request(ctx.app, invitationRoutes.list, { as: inviter.id });

        expect(res.data().map((pending) => pending.id)).toEqual([invitation.id]);
    });

    it('replaces the pending invitation when the same email is invited again', async () => {
        const first = await invite('grace@sentinel.test');
        const second = await invite('Grace@sentinel.test');

        const pending = await request(ctx.app, invitationRoutes.list, { as: second.inviter.id });

        expect(pending.data().map((invitation) => invitation.id)).toEqual([second.invitation.id]);
        expectError(await request(ctx.app, invitationRoutes.preview, { params: { token: first.token } }), 404, 'Invitation::NotFound');
        expect((await request(ctx.app, invitationRoutes.preview, { params: { token: second.token } })).status).toBe(200);
    });

    it('revokes an invitation so its link stops working', async () => {
        const { inviter, invitation, token } = await invite('grace@sentinel.test');

        const revoked = await request(ctx.app, invitationRoutes.revoke, { as: inviter.id, params: { invitationId: invitation.id } });

        expect(revoked.status).toBe(204);
        expectError(await request(ctx.app, invitationRoutes.preview, { params: { token } }), 404, 'Invitation::NotFound');
        expectError(await request(ctx.app, invitationRoutes.revoke, { as: inviter.id, params: { invitationId: invitation.id } }),
            404, 'Invitation::NotFound');
    });

    it('refuses an expired link', async () => {
        const { invitation, token } = await invite('grace@sentinel.test');
        await Invitation.update({ id: invitation.id }, { expiresAt: new Date(Date.now() - DAY_MS) });

        expectError(await request(ctx.app, invitationRoutes.preview, { params: { token } }), 404, 'Invitation::NotFound');
        expectError(await request(ctx.app, invitationRoutes.accept, { params: { token }, body: NEWCOMER }), 404, 'Invitation::NotFound');
        expect(await Operator.countBy({ email: 'grace@sentinel.test' })).toBe(0);
    });

    it('refuses a link nobody issued', async () => {
        expectError(await request(ctx.app, invitationRoutes.preview, { params: { token: 'made-up' } }), 404, 'Invitation::NotFound');
        expectError(await request(ctx.app, invitationRoutes.accept, { params: { token: 'made-up' }, body: NEWCOMER }), 404, 'Invitation::NotFound');
    });

    it('rejects an acceptance whose password is too short', async () => {
        const { token } = await invite('grace@sentinel.test');

        const res = await request(ctx.app, invitationRoutes.accept, { params: { token }, body: { name: 'Grace', password: 'short' } });

        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { password: 'At least 8 characters' } });
    });

    it('rejects an invitation to something that is not an email', async () => {
        const inviter = await seedOperator();

        const res = await request(ctx.app, invitationRoutes.create, { as: inviter.id, body: { email: 'not-an-email' } });

        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { email: 'Invalid email' } });
    });
});
