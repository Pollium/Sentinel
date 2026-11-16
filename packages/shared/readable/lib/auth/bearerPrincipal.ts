import { verifiedSession } from './verifiedSession';
import { Principal, TokenPayload } from './types';
import { FastifyRequest } from 'fastify';

const SCHEME = 'Bearer ';

const bearerSession = async (req: FastifyRequest): Promise<TokenPayload | null> => {
    const header = req.headers.authorization;
    if(!header?.startsWith(SCHEME)) return null;

    return verifiedSession(header.slice(SCHEME.length).trim());
};

export const bearerPrincipal = async (req: FastifyRequest): Promise<Principal | null> => {
    const session = await bearerSession(req);

    return session === null ? null : { userId: session.sub };
};
