import { ReadableDatabaseConfig, ReadableRedisConfig } from './config';
import { optionalEnv, requiredEnv } from './utils/env';

export const serviceConfig = (corsFallback: string) => ({
    port: Number(requiredEnv('PORT')),
    corsOrigins: (optionalEnv('CORS_ORIGIN') ?? corsFallback)
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin !== ''),
    database: {
        url: requiredEnv('DATABASE_URL'),
        schema: optionalEnv('DATABASE_SCHEMA'),
        synchronize: optionalEnv('DATABASE_SYNCHRONIZE') !== 'false'
    } satisfies ReadableDatabaseConfig,
    log: {
        level: optionalEnv('LOG_LEVEL') ?? 'info',
        pretty: optionalEnv('LOG_PRETTY') === 'true'
    }
});

export const redisFromEnv = (): ReadableRedisConfig => ({
    host: requiredEnv('REDIS_HOST'),
    port: Number(requiredEnv('REDIS_PORT'))
});
