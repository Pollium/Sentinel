import Application from '../lib/http/Application';
import RuntimeError from '../lib/errors/RuntimeError';
import { createDataSource } from '../lib/http/data-source';
import { configure } from '../lib/config';
import { afterAll, describe, expect, it } from 'vitest';

interface ClientAddress{
    ip: string;
}

const DATABASE_URL = 'postgres://sentinel:sentinel@localhost:5443/sentinel';
const VISITOR = '203.0.113.7';
const FORGED = '192.0.2.1';
const NGINX = '172.18.0.4';
const INGRESS = '10.0.3.2';
const DIRECT_CLIENT = '198.51.100.9';
const REDIS = { host: 'localhost', port: 6390 };

configure({ jwtSecret: 'test-jwt-secret', redis: REDIS });

const application = new Application({
    port: 0,
    corsOrigins: [],
    log: { level: 'silent', pretty: false },
    discover: async () => ({ controllers: [], entities: [], gateways: [] }),
    createDataSource: (entities) => createDataSource({ url: DATABASE_URL, schema: undefined, synchronize: false }, entities)
});

const app = await application.build();
app.get('/client', (req) => ({ ip: req.ip }));
app.get('/broken', async () => {
    throw new Error('connect ECONNREFUSED 127.0.0.1:5443');
});
app.get('/refused', async () => {
    throw new RuntimeError('Probe::Refused', 502);
});

const clientOf = async (remoteAddress: string, forwardedFor: string): Promise<string> => {
    const res = await app.inject({
        method: 'GET',
        url: '/client',
        remoteAddress,
        headers: { 'x-forwarded-for': forwardedFor }
    });

    return res.json<ClientAddress>().ip;
};

afterAll(() => application.stop());

describe('Application client address', () => {
    it('reads the visitor a proxy on the private network forwarded', async () => {
        await expect(clientOf(NGINX, VISITOR)).resolves.toBe(VISITOR);
    });

    it('walks back through every private hop and stops at the first public one', async () => {
        await expect(clientOf(NGINX, `${FORGED}, ${VISITOR}, ${INGRESS}`)).resolves.toBe(VISITOR);
    });

    it('ignores the forwarded address of a client that connects directly', async () => {
        await expect(clientOf(DIRECT_CLIENT, VISITOR)).resolves.toBe(DIRECT_CLIENT);
    });
});

describe('Application errors', () => {
    it('answers an unexpected failure without its text', async () => {
        const res = await app.inject({ method: 'GET', url: '/broken' });

        expect(res.statusCode).toBe(500);
        expect(res.json()).toEqual({ error: 'Server::Internal' });
    });

    it('answers a domain failure with its code', async () => {
        const res = await app.inject({ method: 'GET', url: '/refused' });

        expect(res.statusCode).toBe(502);
        expect(res.json()).toEqual({ error: 'Probe::Refused' });
    });
});
