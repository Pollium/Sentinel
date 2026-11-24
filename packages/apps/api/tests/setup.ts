import 'reflect-metadata';
import { Client } from 'pg';
import { vi } from 'vitest';

const databaseUrl = 'postgres://sentinel:sentinel@localhost:5443/sentinel';
const schema = `api_test_${(process.env.VITEST_POOL_ID ?? '1').replace(/\W/g, '')}`;

Object.assign(process.env, {
    PORT: '8080',
    DATABASE_URL: databaseUrl,
    DATABASE_SCHEMA: schema,
    ENCRYPTION_KEY: '0'.repeat(64),
    JWT_SECRET: 'test-jwt-secret',
    WEB_URL: 'https://web.test',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6390',
    LOG_LEVEL: 'silent',
    LOG_PRETTY: 'false'
});

const client = new Client({ connectionString: databaseUrl });
await client.connect();
await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
await client.query(`CREATE SCHEMA "${schema}"`);
await client.end();

const { rateLimitStore } = await import('@pollium/readable/testing/rate-limit');
vi.spyOn(rateLimitStore, 'incr').mockImplementation((_key, done) => done(null, { current: 1, ttl: 60_000 }));
