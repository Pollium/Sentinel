import { UsageWindow } from '@sentinel/contracts/usage/domain';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { CreateApiKeyInput, UpdateApiKeyInput } from '@sentinel/contracts/keys/http';
import { CreateProviderInput, DiscoverModelsInput, UpdateProviderInput } from '@sentinel/contracts/providers/http';
import { keyRoutes } from '@sentinel/contracts/keys/routes';
import { providerRoutes } from '@sentinel/contracts/providers/routes';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { call } from '@sentinel/ui/api/call';
import { KINDS } from '@/modules/tower/utils/kinds';

export const towerApi = {
    overview: (window: UsageWindow) => call(usageRoutes.overview, { query: { window } }),
    providerUsage: (id: string, window: UsageWindow) => call(usageRoutes.providerUsage, { path: { id }, query: { window } }),
    modelUsage: (model: string, window: UsageWindow) => call(usageRoutes.modelUsage, { path: { model }, query: { window } }),
    keyUsage: (id: string, window: UsageWindow) => call(usageRoutes.keyUsage, { path: { id }, query: { window } }),
    providers: async () => (await Promise.all(KINDS.map((kind) => call(providerRoutes.providers, { path: { kind } })))).flat(),
    createProvider: (kind: GatewayKind, body: CreateProviderInput) =>
        call(providerRoutes.createProvider, { path: { kind }, body }),
    updateProvider: (id: string, body: UpdateProviderInput) =>
        call(providerRoutes.updateProvider, { path: { id }, body }),
    removeProvider: (id: string) => call(providerRoutes.removeProvider, { path: { id } }),
    discoverModels: (body: DiscoverModelsInput) => call(providerRoutes.discoverModels, { body }),
    keys: () => call(keyRoutes.keys),
    createKey: (body: CreateApiKeyInput) => call(keyRoutes.createKey, { body }),
    updateKey: (id: string, body: UpdateApiKeyInput) => call(keyRoutes.updateKey, { path: { id }, body }),
    removeKey: (id: string) => call(keyRoutes.removeKey, { path: { id } })
};
