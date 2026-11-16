import Provider from '../../models/Provider';
import ProviderHealth from './ProviderHealth';

export const pickProvider = (providers: Provider[], health: ProviderHealth, excluded: Set<string>): Provider | null => {
    const eligible = providers.filter((provider) =>
        !excluded.has(provider.id) && health.isAvailable(provider.id)
    );

    if(eligible.length === 0) return null;

    return eligible[Math.floor(Math.random() * eligible.length)];
};
