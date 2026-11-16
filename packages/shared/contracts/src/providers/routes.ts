import { del, get, patch, post } from '../shared/routing';
import { DiscoveredModels, PublicGatewayProvider } from './domain';
import { CreateProviderInput, DiscoverModelsInput, UpdateProviderInput } from './http';

export const providerRoutes = {
    providers: get<PublicGatewayProvider[]>('/tower/kinds/:kind/providers'),
    createProvider: post<CreateProviderInput, PublicGatewayProvider>('/tower/kinds/:kind/providers'),
    updateProvider: patch<UpdateProviderInput, PublicGatewayProvider>('/tower/providers/:id'),
    removeProvider: del('/tower/providers/:id'),
    discoverModels: post<DiscoverModelsInput, DiscoveredModels>('/tower/models/discover')
};
