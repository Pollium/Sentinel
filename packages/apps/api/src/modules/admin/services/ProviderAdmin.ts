import Provider from '@/modules/providers/models/Provider';
import { findOrThrow } from '@pollium/readable/database/queries';
import { GatewayKind, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { CreateProviderInput, UpdateProviderInput } from '@sentinel/contracts/providers/http';
import { secretCipher } from '@/shared/cipher';
import { providerHealth } from '@/modules/providers/services/pool/ProviderHealth';
import { ProviderError } from '@/modules/providers/contracts/domain/errors';

export default class ProviderAdminService{
    async list(kind: GatewayKind): Promise<PublicGatewayProvider[]>{
        const providers = await Provider.find({
            where: { kind },
            order: { id: 'ASC' }
        });

        return providers.map((provider) => ProviderAdminService.#view(provider));
    }

    async create(kind: GatewayKind, input: CreateProviderInput): Promise<PublicGatewayProvider>{
        const { apiKey, ...profile } = input;
        const provider = await Provider.create({
            ...profile,
            kind,
            encryptedApiKey: secretCipher.encrypt(apiKey)
        }).save();

        return ProviderAdminService.#view(provider);
    }

    async update(providerId: string, patch: UpdateProviderInput): Promise<PublicGatewayProvider>{
        const provider = await findOrThrow(Provider, { id: providerId }, ProviderError.NotFound);

        if(patch.name !== undefined) provider.name = patch.name;
        if(patch.baseUrl !== undefined) provider.baseUrl = patch.baseUrl;
        if(patch.isActive !== undefined) provider.isActive = patch.isActive;
        if(patch.models !== undefined) provider.models = patch.models;
        if(patch.modelMap !== undefined) provider.modelMap = patch.modelMap;
        if(patch.apiKey !== undefined) provider.encryptedApiKey = secretCipher.encrypt(patch.apiKey);
        await provider.save();

        return ProviderAdminService.#view(provider);
    }

    async remove(providerId: string){
        const provider = await findOrThrow(Provider, { id: providerId }, ProviderError.NotFound);
        await provider.remove();
    }

    static #view(provider: Provider): PublicGatewayProvider{
        const health = providerHealth.stateOf(provider.id);

        return {
            id: provider.id,
            createdAt: provider.createdAt.toISOString(),
            updatedAt: provider.updatedAt.toISOString(),
            kind: provider.kind,
            name: provider.name,
            baseUrl: provider.baseUrl,
            isActive: provider.isActive,
            models: provider.models,
            modelMap: provider.modelMap,
            consecutiveFailures: health.consecutiveFailures,
            cooldownUntil: health.cooldownUntil,
            isOutOfCredits: health.isOutOfCredits
        };
    }
}
