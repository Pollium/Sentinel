import { StatusTone } from '@sentinel/ui/components/StatusDot';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';

interface ProviderLook{
    tone: StatusTone | null;
    label: string;
}

export const lookOf = (provider: PublicGatewayProvider, isCoolingDown: boolean): ProviderLook => {
    if(!provider.isActive) return { tone: 'neutral', label: 'Off' };
    if(isCoolingDown) return provider.isOutOfCredits
        ? { tone: 'danger', label: 'Out of credits' }
        : { tone: 'warning', label: 'Cooling down' };

    const failures = provider.consecutiveFailures;
    if(failures > 0) return { tone: 'warning', label: `${failures} ${failures === 1 ? 'failure' : 'failures'} in a row` };

    return { tone: null, label: 'Serving' };
};

export const isCoolingAt = (provider: PublicGatewayProvider, now: number): boolean =>
    provider.cooldownUntil !== null && Date.parse(provider.cooldownUntil) > now;

export const worstTone = (tones: (StatusTone | null)[]): 'danger' | 'warning' | undefined => {
    if(tones.includes('danger')) return 'danger';
    if(tones.includes('warning')) return 'warning';
    return undefined;
};

interface FlaggedProvider{
    provider: PublicGatewayProvider;
    look: ProviderLook;
}

export const flaggedOf = (providers: PublicGatewayProvider[], now: number): FlaggedProvider[] => providers
    .filter((provider) => provider.isActive)
    .map((provider) => ({ provider, look: lookOf(provider, isCoolingAt(provider, now)) }))
    .filter(({ look }) => look.tone !== null);

export const attentionOf = (flagged: FlaggedProvider[]): string | undefined => flagged.length === 0
    ? undefined
    : flagged.map(({ provider, look }) => `${provider.name}: ${look.label.toLowerCase()}`).join(' · ');
