import BaseController from '@pollium/readable/http/Controller';
import ChatCompletionProxy, { CHAT_BODY_LIMIT } from '../services/ChatCompletionProxy';
import { FastifyInstance } from 'fastify';

export default class ChatController extends BaseController{
    #proxy = new ChatCompletionProxy();

    async register(app: FastifyInstance){
        app.post('/v1/chat/completions', { bodyLimit: CHAT_BODY_LIMIT }, (request, reply) =>
            this.#proxy.handle(request, reply));
    }
}
