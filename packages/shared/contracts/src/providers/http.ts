import { GatewayProviderProfile } from './domain';

export interface CreateProviderInput extends GatewayProviderProfile{
    /** @minLength 1 */
    apiKey: string;
}

export type UpdateProviderInput = Partial<CreateProviderInput>;

export interface DiscoverModelsInput{
    /** @minLength 1 */
    baseUrl: string;
    /** @minLength 1 */
    apiKey?: string;
    /** @pattern ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ */
    providerId?: string;
}
