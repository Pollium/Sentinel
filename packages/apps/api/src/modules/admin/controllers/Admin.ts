import ApiKeyAdminService from '../services/ApiKeyAdmin';
import ModelDiscoveryService from '../services/ModelDiscovery';
import OverviewService from '../services/Overview';
import UsageSliceService from '../services/UsageSlice';
import ProviderAdminService from '../services/ProviderAdmin';
import BaseController, { Controller, Route, Status } from '@pollium/readable/http/Controller';
import { Body, IdParam, Param, Query } from '@pollium/readable/http/params';
import { Middleware } from '@pollium/readable/http/middleware';
import { CreateApiKeyInput, UpdateApiKeyInput } from '@sentinel/contracts/keys/http';
import { keyRoutes } from '@sentinel/contracts/keys/routes';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { CreateProviderInput, DiscoverModelsInput, UpdateProviderInput } from '@sentinel/contracts/providers/http';
import { providerRoutes } from '@sentinel/contracts/providers/routes';
import { usageWindowOf } from '@sentinel/contracts/usage/domain';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { OperatorRoute } from '@/modules/operators/middlewares/OperatorRoute';

@Controller('/tower')
@Middleware(OperatorRoute)
export default class AdminController extends BaseController{
    #providers = new ProviderAdminService();
    #keys = new ApiKeyAdminService();
    #overview = new OverviewService();
    #usage = new UsageSliceService();
    #discovery = new ModelDiscoveryService();

    @Route(usageRoutes.overview)
    overview(@Query('window') window: string | undefined){
        return this.#overview.read(usageWindowOf(window));
    }

    @Route(usageRoutes.providerUsage)
    providerUsage(@IdParam('id') id: string, @Query('window') window: string | undefined){
        return this.#usage.read(usageWindowOf(window), { field: 'providerId', value: id });
    }

    @Route(usageRoutes.modelUsage)
    modelUsage(@Param('model') model: string, @Query('window') window: string | undefined){
        return this.#usage.read(usageWindowOf(window), { field: 'model', value: model });
    }

    @Route(usageRoutes.keyUsage)
    keyUsage(@IdParam('id') id: string, @Query('window') window: string | undefined){
        return this.#usage.read(usageWindowOf(window), { field: 'apiKeyId', value: id });
    }

    @Route(providerRoutes.providers)
    providers(@Param('kind') kind: GatewayKind){
        return this.#providers.list(kind);
    }

    @Route(providerRoutes.createProvider)
    @Status(201)
    createProvider(@Param('kind') kind: GatewayKind, @Body() body: CreateProviderInput){
        return this.#providers.create(kind, body);
    }

    @Route(providerRoutes.updateProvider)
    updateProvider(@IdParam('id') id: string, @Body() body: UpdateProviderInput){
        return this.#providers.update(id, body);
    }

    @Route(providerRoutes.removeProvider)
    removeProvider(@IdParam('id') id: string){
        return this.#providers.remove(id);
    }

    @Route(providerRoutes.discoverModels)
    discoverModels(@Body() body: DiscoverModelsInput){
        return this.#discovery.discover(body);
    }

    @Route(keyRoutes.keys)
    keys(){
        return this.#keys.list();
    }

    @Route(keyRoutes.createKey)
    @Status(201)
    createKey(@Body() body: CreateApiKeyInput){
        return this.#keys.create(body);
    }

    @Route(keyRoutes.updateKey)
    updateKey(@IdParam('id') id: string, @Body() body: UpdateApiKeyInput){
        return this.#keys.update(id, body);
    }

    @Route(keyRoutes.removeKey)
    removeKey(@IdParam('id') id: string){
        return this.#keys.remove(id);
    }
}
