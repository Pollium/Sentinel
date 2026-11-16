import 'reflect-metadata';
import BaseGateway, { ACCESS_REVOKED, REAUTHORIZE_MS, SESSION_EXPIRED } from '../lib/gateway/BaseGateway';
import JWTService from '../lib/auth/JWTService';
import { SocketAuthenticatedRoute } from '../lib/auth/SocketAuthenticatedRoute';
import { sessionCutoffs } from '../lib/auth/verifiedSession';
import { configure } from '../lib/config';
import { Channel } from '../lib/decorators/gateway/Channel';
import { OnMessage } from '../lib/decorators/gateway/Gateway';
import { Socket } from '../lib/decorators/gateway/Params';
import { Middleware } from '../lib/decorators/middleware/Middleware';
import websocket, { WebSocket } from '@fastify/websocket';
import jsonwebtoken from 'jsonwebtoken';
import Fastify, { FastifyInstance } from 'fastify';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const CHANNEL = '/probe';
const JWT_SECRET = 'test-jwt-secret';
const ROOM = 'probe:room';

let roomOpen = true;

@Channel(CHANNEL)
@Middleware(SocketAuthenticatedRoute)
class ProbeGateway extends BaseGateway{
    @OnMessage('probe.join')
    join(@Socket() socket: WebSocket){
        this.connections.join(socket, ROOM, async () => {
            if(!roomOpen) throw new Error('left the room');
        });

        return { joined: true };
    }
}

interface Client{
    socket: WebSocket;
    replies: string[];
    closed: Promise<number>;
}

const apps: FastifyInstance[] = [];

const connect = async (token: string): Promise<Client> => {
    const app = Fastify();
    apps.push(app);
    await app.register(websocket);
    new ProbeGateway().register(app);
    await app.ready();

    const replies: string[] = [];
    const socket = await app.injectWS(CHANNEL, { headers: { 'sec-websocket-protocol': token } }, {
        onInit: (ws) => ws.on('message', (raw) => replies.push(String(raw)))
    });
    const closed = new Promise<number>((resolve) => socket.on('close', (code) => resolve(code)));

    return {
        socket,
        replies,
        closed
    };
};

const joined = async (client: Client) => {
    client.socket.send(JSON.stringify({ type: 'probe.join' }));
    await expect.poll(() => client.replies.length).toBe(1);
};

describe('a live socket follows current authorization', () => {
    const jwt = new JWTService();

    beforeAll(() => {
        configure({
            jwtSecret: JWT_SECRET,
            redis: { host: 'localhost', port: 6390 }
        });
    });

    beforeEach(() => {
        roomOpen = true;
        vi.spyOn(sessionCutoffs, 'cutoffOf').mockResolvedValue(null);
    });

    afterEach(async () => {
        vi.useRealTimers();
        await Promise.all(apps.splice(0).map((app) => app.close()));
    });

    it('closes once the token it opened with expires', async () => {
        vi.useFakeTimers({ toFake: ['Date'], now: Math.ceil(Date.now() / 1000) * 1000 });
        const expiring = jsonwebtoken.sign({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 1 }, JWT_SECRET, { algorithm: 'HS256' });
        const client = await connect(expiring);

        expect(await client.closed).toBe(SESSION_EXPIRED);
    });

    it('closes once a credential change cuts the session', async () => {
        vi.useFakeTimers({ toFake: ['setInterval'] });
        const token = jwt.sign('user-1');
        const client = await connect(token);

        vi.spyOn(sessionCutoffs, 'cutoffOf').mockResolvedValue(jwt.verify(token).iat + 1);
        vi.advanceTimersByTime(REAUTHORIZE_MS);

        expect(await client.closed).toBe(ACCESS_REVOKED);
    });

    it('closes once the socket may no longer be in a room it joined', async () => {
        vi.useFakeTimers({ toFake: ['setInterval'] });
        const client = await connect(jwt.sign('user-1'));
        await joined(client);

        roomOpen = false;
        vi.advanceTimersByTime(REAUTHORIZE_MS);

        expect(await client.closed).toBe(ACCESS_REVOKED);
    });

    it('stays open while every check still holds', async () => {
        vi.useFakeTimers({ toFake: ['setInterval'] });
        const client = await connect(jwt.sign('user-1'));
        await joined(client);

        vi.advanceTimersByTime(REAUTHORIZE_MS);
        client.socket.send(JSON.stringify({ type: 'probe.join' }));
        await expect.poll(() => client.replies.length).toBe(2);

        expect(client.socket.readyState).toBe(client.socket.OPEN);
    });
});
