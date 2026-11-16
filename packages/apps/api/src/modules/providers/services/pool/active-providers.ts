import Provider from '../../models/Provider';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { PoolError } from '../../contracts/domain/errors';

export const activeProviders = async (kind: GatewayKind): Promise<Provider[]> => {
    const providers = await Provider.find({
        where: { kind, isActive: true },
        order: { id: 'ASC' }
    });

    if(providers.length === 0) throw PoolError.NoProvider(kind);
    return providers;
};
