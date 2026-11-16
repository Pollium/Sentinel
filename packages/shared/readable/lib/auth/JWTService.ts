import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';
import { TokenPayload } from './types';

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const ALGORITHM = 'HS256';

export default class JWTService{
    sign(userId: string): string{
        return jwt.sign({ sub: String(userId) }, jwtSecret(), { algorithm: ALGORITHM, expiresIn: SESSION_TTL_SECONDS });
    }

    verify(token: string): TokenPayload{
        return jwt.verify(token, jwtSecret(), { algorithms: [ALGORITHM] }) as TokenPayload;
    }
}
