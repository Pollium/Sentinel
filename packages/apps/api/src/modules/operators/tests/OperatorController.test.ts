import Operator from '../models/Operator';
import { expectError, request } from '@pollium/readable/testing/request';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { uuid } from '@tests/uuid';
import { useApp } from '@tests/harness';
import { bearer, seedOperator, tokenIssuedEarlier } from '@tests/operators';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('OperatorController', () => {
    const ctx = useApp();
    afterEach(() => vi.restoreAllMocks());

    it('requires a token', async () => {
        expectError(await request(ctx.app, operatorRoutes.list), 401, 'Auth::Unauthorized');
    });

    it('refuses a valid token of someone who is not an operator', async () => {
        expectError(await request(ctx.app, operatorRoutes.list, { as: uuid(9) }), 401, 'Auth::Unauthorized');
    });

    it('lists the operators in the order they joined', async () => {
        const first = await seedOperator();
        const second = await seedOperator();

        const res = await request(ctx.app, operatorRoutes.list, { as: first.id });

        expect(res.data().map((operator) => operator.id)).toEqual([first.id, second.id]);
        expect(res.data()[0]).not.toHaveProperty('passwordHash');
    });

    it('removes another operator, who loses access at once', async () => {
        const actor = await seedOperator();
        const removed = await seedOperator();
        const token = tokenIssuedEarlier(removed.id);

        const res = await request(ctx.app, operatorRoutes.remove, { as: actor.id, params: { operatorId: removed.id } });

        expect(res.status).toBe(204);
        expect(await Operator.existsBy({ id: removed.id })).toBe(false);
        expectError(await request(ctx.app, operatorRoutes.list, { headers: bearer(token) }), 401, 'Auth::InvalidToken');
        expectError(await request(ctx.app, operatorRoutes.list, { as: removed.id }), 401, 'Auth::Unauthorized');
    });

    it('keeps one operator when the last two remove each other at once', async () => {
        const first = await seedOperator();
        const second = await seedOperator();
        const bothLoaded = Promise.withResolvers<void>();
        let loaded = 0;
        const operators = Operator.getRepository();
        const findOneBy = operators.findOneBy.bind(operators);
        vi.spyOn(operators, 'findOneBy').mockImplementation(async (where) => {
            const found = await findOneBy(where);
            loaded += 1;
            if(loaded === 2) bothLoaded.resolve();
            await bothLoaded.promise;
            return found;
        });

        const results = await Promise.all([
            request(ctx.app, operatorRoutes.remove, { as: first.id, params: { operatorId: second.id } }),
            request(ctx.app, operatorRoutes.remove, { as: second.id, params: { operatorId: first.id } })
        ]);

        expect(results.map((res) => res.status).sort()).toEqual([204, 401]);
        expect(await Operator.count()).toBe(1);
    });

    it('refuses to remove the operator asking', async () => {
        const actor = await seedOperator();

        const res = await request(ctx.app, operatorRoutes.remove, { as: actor.id, params: { operatorId: actor.id } });

        expectError(res, 409, 'Operator::RemoveSelf');
        expect(await Operator.existsBy({ id: actor.id })).toBe(true);
    });

    it('answers not found for an operator that does not exist', async () => {
        const actor = await seedOperator();

        const res = await request(ctx.app, operatorRoutes.remove, { as: actor.id, params: { operatorId: uuid(9) } });

        expectError(res, 404, 'Operator::NotFound');
    });
});
