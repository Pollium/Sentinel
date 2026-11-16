import { useLiveProviders } from '@/modules/tower/hooks/use-live-providers';
import { unpricedRoutes } from '@/modules/tower/utils/prices';
import { attentionOf, flaggedOf } from '@/modules/tower/utils/provider-look';

export const useNavAttention = (): Record<string, string | undefined> => {
    const providers = useLiveProviders().data ?? [];
    const unpriced = unpricedRoutes(providers);

    return {
        '/providers': attentionOf(flaggedOf(providers, Date.now())),
        '/models': unpriced.length === 0 ? undefined : `No price: ${unpriced.map(({ provider, model }) => `${model.id} on ${provider.name}`).join(', ')}`
    };
};
