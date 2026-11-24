import Operator from '@/modules/operators/models/Operator';
import { PasswordService } from '@pollium/readable/auth/credentials';
import { rateLimitStore } from '@pollium/readable/testing/rate-limit';
import { expectError, request } from '@pollium/readable/testing/request';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { useApp } from '@tests/harness';
import { OPERATOR_PASSWORD, seedOperator } from '@tests/operators';
import { describe, expect, it, vi } from 'vitest';

const OWNER = {
    name: 'Ada Lovelace',
    email: 'Ada@Sentinel.test',
    password: 'owner-password-123'
};

const CHANGED_HASH = 'salt:changed-elsewhere';

describe('AuthController', () => {
    const ctx = useApp();

    it('opens setup until the first operator exists, then closes it', async () => {
        const before = await request(ctx.app, authRoutes.setupStatus);
        const created = await request(ctx.app, authRoutes.setup, { body: OWNER });
        const after = await request(ctx.app, authRoutes.setupStatus);
        const again = await request(ctx.app, authRoutes.setup, { body: { ...OWNER, email: 'grace@sentinel.test' } });

        expect(before.data()).toEqual({ needsOwner: true });
        expect(created.status).toBe(201);
        expect(created.data().operator).toMatchObject({ email: 'ada@sentinel.test', name: OWNER.name });
        expect(created.data().operator).not.toHaveProperty('passwordHash');
        expect(after.data()).toEqual({ needsOwner: false });
        expectError(again, 409, 'Auth::SetupClosed');
        expect(await Operator.count()).toBe(1);
    });

    it('signs the first operator in with the token setup returns', async () => {
        const { token, operator } = (await request(ctx.app, authRoutes.setup, { body: OWNER })).data();

        const me = await request(ctx.app, authRoutes.me, { headers: { authorization: `Bearer ${token}` } });

        expect(me.data()).toMatchObject({ id: operator.id, email: 'ada@sentinel.test' });
        expect(operator.lastSignInAt).not.toBeNull();
    });

    it('creates a single operator when two setups race', async () => {
        const results = await Promise.all([
            request(ctx.app, authRoutes.setup, { body: OWNER }),
            request(ctx.app, authRoutes.setup, { body: { ...OWNER, email: 'grace@sentinel.test' } })
        ]);

        expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
        expect(await Operator.count()).toBe(1);
    });

    it('keeps setup closed once an operator exists', async () => {
        await seedOperator();

        expectError(await request(ctx.app, authRoutes.setup, { body: OWNER }), 409, 'Auth::SetupClosed');
        expect(await Operator.count()).toBe(1);
    });

    it('rejects a setup whose password is too short', async () => {
        const res = await request(ctx.app, authRoutes.setup, { body: { ...OWNER, password: 'short' } });

        expectError(res, 400, 'Request::ValidationFailed');
        expect(res.json()).toMatchObject({ errors: { password: 'At least 8 characters' } });
    });

    it('signs in with any email casing and records when', async () => {
        const operator = await seedOperator();

        const res = await request(ctx.app, authRoutes.signIn, {
            body: { email: operator.email.toUpperCase(), password: OPERATOR_PASSWORD }
        });

        expect(res.status).toBe(200);
        expect(res.data().operator).toMatchObject({ id: operator.id, email: operator.email });
        expect(res.data().token).toEqual(expect.any(String));
        expect((await Operator.findOneByOrFail({ id: operator.id })).lastSignInAt).toBeInstanceOf(Date);
    });

    it('keeps a password changed while a sign-in was checking the old one', async () => {
        const operator = await seedOperator();
        const verify = PasswordService.prototype.verify;
        const spy = vi.spyOn(PasswordService.prototype, 'verify').mockImplementationOnce(async function(this: PasswordService, password, stored){
            const matches = await verify.call(this, password, stored);
            await Operator.update({ id: operator.id }, { passwordHash: CHANGED_HASH });
            return matches;
        });

        const res = await request(ctx.app, authRoutes.signIn, { body: { email: operator.email, password: OPERATOR_PASSWORD } });

        expect(res.status).toBe(200);
        expect((await Operator.findOneByOrFail({ id: operator.id })).passwordHash).toBe(CHANGED_HASH);
        spy.mockRestore();
    });

    it('refuses a wrong password and an unknown email alike', async () => {
        const operator = await seedOperator();

        const wrong = await request(ctx.app, authRoutes.signIn, { body: { email: operator.email, password: 'not-the-password' } });
        const unknown = await request(ctx.app, authRoutes.signIn, { body: { email: 'nobody@sentinel.test', password: OPERATOR_PASSWORD } });

        expectError(wrong, 401, 'Auth::InvalidCredentials');
        expectError(unknown, 401, 'Auth::InvalidCredentials');
        expect((await Operator.findOneByOrFail({ id: operator.id })).lastSignInAt).toBeNull();
    });

    it('checks a password for an unknown email too, so both take as long', async () => {
        const verify = vi.spyOn(PasswordService.prototype, 'verify');

        await request(ctx.app, authRoutes.signIn, { body: { email: 'nobody@sentinel.test', password: OPERATOR_PASSWORD } });

        expect(verify).toHaveBeenCalledOnce();
        verify.mockRestore();
    });

    it('limits sign-in attempts', async () => {
        const operator = await seedOperator();
        vi.mocked(rateLimitStore.incr).mockImplementationOnce((_key, done) => done(null, { current: 6, ttl: 30_000 }));

        const res = await request(ctx.app, authRoutes.signIn, { body: { email: operator.email, password: OPERATOR_PASSWORD } });

        expectError(res, 429, 'RateLimit::TooManyRequests');
    });
});
