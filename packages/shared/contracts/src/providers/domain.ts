import { BaseEntity } from '../shared/base';

type ReasoningDialect = 'none' | 'effort' | 'thinking';

export type ReasoningEffort = 'low' | 'medium' | 'high';

export interface ProviderModel{
    /** @minLength 1 */
    id: string;
    inputPricePerMillion: number | null;
    cachedInputPricePerMillion: number | null;
    outputPricePerMillion: number | null;
    reasoning?: ReasoningDialect;
    reasoningDefault?: ReasoningEffort | null;
    reasoningReserve?: number | null;
    /** @type uint32 @minimum 1024 */
    contextWindow?: number | null;
}

export type GatewayKind = 'chat' | 'voice' | 'search';

export interface GatewayProviderProfile{
    /** @minLength 1 */
    name: string;
    /** @minLength 1 */
    baseUrl: string;
    isActive: boolean;
    models: ProviderModel[];
    modelMap: Record<string, string>;
}

export interface GatewayProviderHealth{
    consecutiveFailures: number;
    cooldownUntil: string | null;
    isOutOfCredits: boolean;
}

export interface PublicGatewayProvider extends GatewayProviderProfile, GatewayProviderHealth, BaseEntity{
    kind: GatewayKind;
}

export interface DiscoveredModels{
    models: ProviderModel[];
}
