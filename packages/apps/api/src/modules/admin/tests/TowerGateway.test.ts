import Operator from '@/modules/operators/models/Operator';
import OverviewService from '../services/Overview';
import OverviewPushes, { OVERVIEW_PUSH_INTERVAL_MS } from '../services/OverviewPushes';
import { usageRecorder } from '@/modules/providers/services/pool/UsageRecorder';
import { providerHealth } from '@/modules/providers/services/pool/ProviderHealth';
import { eventBus } from '@pollium/readable/events/EventBus';
import { ACCESS_REVOKED } from '@sentinel/contracts/shared/socket';
import { UsageWindow } from '@sentinel/contracts/usage/domain';
import { GatewayProviderHealth } from '@sentinel/contracts/providers/domain';
import { TowerFrame, towerGateway } from '@sentinel/contracts/live/gateway';
import { uuid } from '@tests/uuid';
import { useApp } from '@tests/harness';
import { seedApiKey, seedProvider } from '@tests/seed';
import { OPERATOR_ID, seedOperator, tokenFor } from '@tests/operators';
import { FastifyInstance } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const COOLDOWN_FAILURES = 3;
const COOLDOWN_MS = 30_000;
const STRANGER_ID = uuid(2);
const BURST = 3;
const PUSHED = { timeout: OVERVIEW_PUSH_INTERVAL_MS * 3 };

interface Visitor{
    socket: WebSocket;
    frames: TowerFrame[];
}

const open: WebSocket[] = [];

const visit = async (app: FastifyInstance, operatorId: string | null = OPERATOR_ID): Promise<Visitor> => {
    const frames: TowerFrame[] = [];
    const headers = operatorId === null ? {} : { 'sec-websocket-protocol': tokenFor(operatorId) };

    await app.ready();
    const socket = await app.injectWS(towerGateway.channel, { headers }, {
        onInit: (ws) => ws.on('message', (raw) => frames.push(JSON.parse(String(raw)) as TowerFrame))
    });
    open.push(socket);

    return {
        socket,
        frames
    };
};

const watching = async (app: FastifyInstance, window: UsageWindow): Promise<Visitor> => {
    const visitor = await visit(app);
    visitor.socket.send(JSON.stringify({ type: 'tower.watch', window }));
    await expect.poll(() => visitor.frames.map((frame) => frame.type)).toEqual(['tower.watch']);

    return visitor;
};

const recordUsage = async (requests: number) => {
    const key = await seedApiKey();
    const provider = await seedProvider('chat');

    for(let request = 0; request < requests; request++){
        await usageRecorder.write({
            provider,
            apiKeyId: key.id,
            kind: 'chat',
            model: 'm1',
            inputTokens: 10,
            cachedTokens: 0,
            outputTokens: 5,
            latencyMs: 100,
            status: 200
        });
    }
};

const overviewsOf = (visitor: Visitor) => visitor.frames.filter((frame) => frame.type === 'tower.overview');

const healthOf = (visitor: Visitor, providerId: string): GatewayProviderHealth[] =>
    visitor.frames.flatMap((frame) =>
        frame.type === 'tower.provider.health' && frame.data.providerId === providerId ? [frame.data.health] : []
    );

describe('TowerGateway', () => {
    const ctx = useApp();
    beforeEach(() => seedOperator({ id: OPERATOR_ID }));

    afterEach(() => {
        open.splice(0).forEach((socket) => socket.terminate());
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('refuses a socket without a session', async () => {
        await expect(visit(ctx.app, null)).rejects.toThrow('401');
    });

    it('refuses a token of someone who is not an operator', async () => {
        await expect(visit(ctx.app, STRANGER_ID)).rejects.toThrow('401');
    });

    it('stops answering a watch once the operator is removed', async () => {
        const visitor = await visit(ctx.app);
        visitor.socket.send(JSON.stringify({ type: 'tower.watch', window: UsageWindow.Week }));
        await expect.poll(() => visitor.frames.length).toBe(1);
        await Operator.delete({ id: OPERATOR_ID });

        visitor.socket.send(JSON.stringify({ type: 'tower.watch', window: UsageWindow.Month }));
        await expect.poll(() => visitor.frames.length).toBe(2);

        expect(visitor.frames[1]).toEqual({ error: 'Auth::Unauthorized' });
    });

    it('closes the socket of a removed operator at the next check', async () => {
        vi.useFakeTimers({ toFake: ['setInterval'] });
        const visitor = await visit(ctx.app);
        const closed = new Promise<number>((resolve) => visitor.socket.on('close', (code) => resolve(code)));

        await Operator.delete({ id: OPERATOR_ID });
        vi.advanceTimersByTime(30_000);

        expect(await closed).toBe(ACCESS_REVOKED);
    });

    it('answers a watch with the overview of that window', async () => {
        const visitor = await watching(ctx.app, UsageWindow.Week);

        expect(visitor.frames[0]).toMatchObject({
            type: 'tower.watch',
            data: { window: UsageWindow.Week, totals: { requests: 0 } }
        });
    });

    it('schedules nothing for recorded usage while no socket watches a window', async () => {
        const changed = vi.spyOn(OverviewPushes.prototype, 'changed');
        await visit(ctx.app);

        await recordUsage(BURST);
        await eventBus.settled();

        expect(changed).not.toHaveBeenCalled();
    });

    it('pushes a burst of usage once to each socket, computing only the windows they watch', async () => {
        const switched = await watching(ctx.app, UsageWindow.Month);
        switched.socket.send(JSON.stringify({ type: 'tower.watch', window: UsageWindow.Week }));
        await expect.poll(() => switched.frames).toHaveLength(2);
        const allTime = await watching(ctx.app, UsageWindow.All);
        const read = vi.spyOn(OverviewService.prototype, 'read');

        await recordUsage(BURST);

        await expect.poll(() => [overviewsOf(switched).length, overviewsOf(allTime).length], PUSHED).toEqual([1, 1]);
        expect(overviewsOf(switched)[0]?.data).toMatchObject({ window: UsageWindow.Week, totals: { requests: BURST } });
        expect(overviewsOf(allTime)[0]?.data).toMatchObject({ window: UsageWindow.All, totals: { requests: BURST } });
        expect(read.mock.calls.map(([window]) => window)).toEqual([UsageWindow.Week, UsageWindow.All]);
    });

    it('tells every operator socket as a provider fails, cools down and comes back', async () => {
        const first = await visit(ctx.app);
        const second = await visit(ctx.app);
        const providerId = uuid(7);

        providerHealth.recordFailure(providerId);
        providerHealth.recordSuccess(providerId);
        for(let failure = 0; failure < COOLDOWN_FAILURES; failure++) providerHealth.recordFailure(providerId);
        const cooledAt = Date.now();
        await expect.poll(() => healthOf(first, providerId)).toHaveLength(COOLDOWN_FAILURES + 2);

        vi.spyOn(Date, 'now').mockReturnValue(cooledAt + COOLDOWN_MS);
        providerHealth.isAvailable(providerId);

        await expect.poll(() => healthOf(first, providerId)).toHaveLength(COOLDOWN_FAILURES + 3);
        expect(healthOf(first, providerId).map((health) => health.consecutiveFailures)).toEqual([1, 0, 1, 2, 0, 0]);
        expect(healthOf(first, providerId).map((health) => health.cooldownUntil !== null)).toEqual([false, false, false, false, true, false]);
        expect(healthOf(second, providerId)).toEqual(healthOf(first, providerId));
    });
});
