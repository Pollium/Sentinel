import RedisSessionCutoffStore from '../services/RedisSessionCutoffStore';
import JWTService from './JWTService';
import { SessionCutoffStore } from '../contracts/session';
import { AuthError } from './errors';
import { TokenPayload } from './types';

export const sessionCutoffs: SessionCutoffStore = new RedisSessionCutoffStore();

const decoded = (token: string): TokenPayload => {
    try{
        return new JWTService().verify(token);
    }catch{
        throw AuthError.InvalidToken();
    }
};

export const verifiedSession = async (token: string): Promise<TokenPayload> => {
    const session = decoded(token);
    const cutoff = await sessionCutoffs.cutoffOf(session.sub);
    if(cutoff !== null && session.iat < cutoff) throw AuthError.InvalidToken();

    return session;
};
