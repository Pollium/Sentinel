import BaseController from '@pollium/readable/http/Controller';
import { SUBSCRIPTION_AUTH } from '@/modules/keys/services/authenticate';
import { bufferedProxyHandler } from '@/modules/providers/services/proxy/buffered-proxy';
import { FastifyInstance } from 'fastify';

export default class SearchController extends BaseController{
    #handle = bufferedProxyHandler({
        kind: 'search',
        ingress: SUBSCRIPTION_AUTH,
        providerAuth: (apiKey) => ({ 'x-subscription-token': apiKey })
    });

    async register(app: FastifyInstance){
        app.get('/res/v1/llm/context', (request, reply) => this.#handle(request, reply));
    }
}
