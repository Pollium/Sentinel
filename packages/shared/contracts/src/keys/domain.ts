import { BaseEntity } from '../shared/base';

export interface GatewayApiKeyProfile{
    /** @minLength 1 */
    name: string;
    isActive: boolean;
}

export interface PublicGatewayApiKey extends GatewayApiKeyProfile, BaseEntity{
    preview: string;
    requests: number;
    lastUsedAt: string | null;
}

export interface IssuedGatewayApiKey{
    key: PublicGatewayApiKey;
    secret: string;
}
