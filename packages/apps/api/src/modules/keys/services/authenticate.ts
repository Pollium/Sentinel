import ApiKey from '../models/ApiKey';
import { hashOf } from '../utils/key-secret';
import { ApiKeyError } from '../contracts/domain/errors';
import { IncomingHttpHeaders } from 'node:http';

export interface AuthShape{
    header: string;
    prefix: string | null;
}

export const BEARER_AUTH: AuthShape = { header: 'authorization', prefix: 'Bearer' };
export const TOKEN_AUTH: AuthShape = { header: 'authorization', prefix: 'Token' };
export const SUBSCRIPTION_AUTH: AuthShape = { header: 'x-subscription-token', prefix: null };

const credentialOf = (headers: IncomingHttpHeaders, shape: AuthShape): string => {
    const value = headers[shape.header];
    if(typeof value !== 'string') throw ApiKeyError.Unauthorized();

    if(shape.prefix === null) return value;

    const prefix = `${shape.prefix} `;
    if(!value.startsWith(prefix)) throw ApiKeyError.Unauthorized();

    return value.slice(prefix.length);
};

export const authenticateClient = async (headers: IncomingHttpHeaders, shape: AuthShape): Promise<ApiKey> => {
    const key = await ApiKey.findOneBy({
        keyHash: hashOf(credentialOf(headers, shape)),
        isActive: true
    });

    if(key === null) throw ApiKeyError.Unauthorized();
    return key;
};
