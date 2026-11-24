import {
    configure,
    redisFromEnv,
    serviceConfig,
    optionalEnv,
    requiredEnv
} from '@pollium/readable/app/config';

const DEV_WEB_URL = 'https://localhost:5175';

export const config = {
    ...serviceConfig(DEV_WEB_URL),
    redis: redisFromEnv(),
    encryptionKey: requiredEnv('ENCRYPTION_KEY'),
    jwtSecret: requiredEnv('JWT_SECRET'),
    webUrl: optionalEnv('WEB_URL') ?? DEV_WEB_URL,
    upstreamFirstByteTimeoutMs: Number(optionalEnv('UPSTREAM_FIRST_BYTE_TIMEOUT_MS') ?? 30_000)
};

configure({
    name: 'sentinel',
    jwtSecret: config.jwtSecret,
    redis: config.redis,
    storage: null
});
