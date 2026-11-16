import { GatewayApiKeyProfile } from './domain';

export type CreateApiKeyInput = GatewayApiKeyProfile;

export type UpdateApiKeyInput = Partial<GatewayApiKeyProfile>;
