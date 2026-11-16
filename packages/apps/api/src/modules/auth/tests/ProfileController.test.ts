import Operator from '@/modules/operators/models/Operator';
import { expectError, request } from '@readable/testing/request';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { useApp } from '@tests/harness';
import { bearer, OPERATOR_PASSWORD, seedOperator, tokenIssuedEarlier } from '@tests/operators';
import { describe, expect, it } from 'vitest';

const NEXT_PASSWORD = 'brand-new-password';

describe('ProfileController', () => {
    const ctx = useApp();

    it('requires a token', async () => {
        expectError(await request(ctx.app, authRoutes.me), 401, 'Auth::Unauthorized');
    });

    it('returns the signed-in operator without the password hash', async () => {
        const operator = await seedOperator();

        const res = await request(ctx.app, authRoutes.me, { as: operator.id });

        expect(res.data()).toEqual({
            id: operator.id,
            email: operator.email,
            name: operator.name,
            lastSignInAt: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    });

    it('treats the token of a removed operator as signed out', async () => {
        const operator = await seedOperator();
        await Operator.delete({ id: operator.id });

        expectError(await request(ctx.app, authRoutes.me, { as: operator.id }), 401, 'Auth::Unauthorized');
    });

    it('renames the operator', async () => {
        const operator = await seedOperator();

        const res = await request(ctx.app, authRoutes.updateProfile, { as: operator.id, body: { name: 'Grace Hopper' } });

        expect(res.data()).toMatchObject({ id: operator.id, name: 'Grace Hopper' });
        expect((await Operator.findOneByOrFail({ id: operator.id })).name).toBe('Grace Hopper');
    });

    it('rejects an empty name', async () => {
        const operator = await seedOperator();

        const res = await request(ctx.app, authRoutes.updateProfile, { as: operator.id, body: { name: '' } });

        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { name: 'Required' } });
    });

    it('changes the password only when the current one matches', async () => {
        const operator = await seedOperator();

        const wrong = await request(ctx.app, authRoutes.changePassword, {
            as: operator.id,
            body: { currentPassword: 'a-wrong-guess', newPassword: NEXT_PASSWORD }
        });
        const changed = await request(ctx.app, authRoutes.changePassword, {
            as: operator.id,
            body: { currentPassword: OPERATOR_PASSWORD, newPassword: NEXT_PASSWORD }
        });
        const oldSignIn = await request(ctx.app, authRoutes.signIn, { body: { email: operator.email, password: OPERATOR_PASSWORD } });
        const newSignIn = await request(ctx.app, authRoutes.signIn, { body: { email: operator.email, password: NEXT_PASSWORD } });

        expectError(wrong, 400, 'Auth::WrongPassword');
        expect(changed.status).toBe(200);
        expectError(oldSignIn, 401, 'Auth::InvalidCredentials');
        expect(newSignIn.status).toBe(200);
    });

    it('signs every older session out and hands back a fresh one', async () => {
        const operator = await seedOperator();
        const old = tokenIssuedEarlier(operator.id);

        const changed = await request(ctx.app, authRoutes.changePassword, {
            headers: bearer(old),
            body: { currentPassword: OPERATOR_PASSWORD, newPassword: NEXT_PASSWORD }
        });
        const withOld = await request(ctx.app, authRoutes.me, { headers: bearer(old) });
        const withFresh = await request(ctx.app, authRoutes.me, { headers: bearer(changed.data().token) });

        expect(changed.data().operator).toMatchObject({ id: operator.id });
        expect(changed.data().operator).not.toHaveProperty('passwordHash');
        expectError(withOld, 401, 'Auth::InvalidToken');
        expect(withFresh.data()).toMatchObject({ id: operator.id });
    });
});
