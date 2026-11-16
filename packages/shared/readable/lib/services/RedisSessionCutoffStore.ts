import { SESSION_TTL_SECONDS } from '../auth/JWTService';
import { SessionCutoffStore } from '../contracts/session';
import { redis } from '../redis/RedisClient';

const PREFIX = 'session:cutoff:';

export default class RedisSessionCutoffStore implements SessionCutoffStore{
    async cutoffOf(userId: string): Promise<number | null>{
        const value = await redis.get(`${PREFIX}${userId}`);

        return value === null ? null : Number(value);
    }

    async cut(userId: string){
        await redis.set(`${PREFIX}${userId}`, String(Math.floor(Date.now() / 1000)), 'EX', SESSION_TTL_SECONDS);
    }
}
