import { del, get, patch, post } from '@pollium/readable-contracts/routing';
import { IssuedGatewayApiKey, PublicGatewayApiKey } from './domain';
import { CreateApiKeyInput, UpdateApiKeyInput } from './http';

export const keyRoutes = {
    keys: get<PublicGatewayApiKey[]>('/tower/keys'),
    createKey: post<CreateApiKeyInput, IssuedGatewayApiKey>('/tower/keys'),
    updateKey: patch<UpdateApiKeyInput, PublicGatewayApiKey>('/tower/keys/:id'),
    removeKey: del('/tower/keys/:id')
};
