import { get } from '../shared/routing';
import { GatewayOverview, GatewayUsageSlice } from './domain';

export const usageRoutes = {
    overview: get<GatewayOverview>('/tower/overview'),
    providerUsage: get<GatewayUsageSlice>('/tower/providers/:id/usage'),
    modelUsage: get<GatewayUsageSlice>('/tower/models/:model/usage'),
    keyUsage: get<GatewayUsageSlice>('/tower/keys/:id/usage')
};
