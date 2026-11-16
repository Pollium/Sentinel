export type UsageScopeField = 'providerId' | 'model' | 'apiKeyId';

export interface UsageScope{
    field: UsageScopeField;
    value: string;
}

export interface UsageRange{
    since: Date | null;
    until: Date | null;
}
