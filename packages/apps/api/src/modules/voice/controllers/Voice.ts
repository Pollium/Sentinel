import BaseController from '@readable/controllers/BaseController';
import { TOKEN_AUTH } from '@/modules/keys/services/authenticate';
import { bufferedProxyHandler } from '@/modules/providers/services/proxy/buffered-proxy';
import { FastifyInstance } from 'fastify';

const modelOf = (url: string): string => {
    return new URL(`http://gateway${url}`).searchParams.get('model') ?? 'voice';
};

export default class VoiceController extends BaseController{
    #handle = bufferedProxyHandler({
        kind: 'voice',
        ingress: TOKEN_AUTH,
        providerAuth: (apiKey) => ({ authorization: `Token ${apiKey}` }),
        modelOf
    });

    async register(app: FastifyInstance){
        await app.register(async (scope) => {
            scope.addContentTypeParser(
                'application/json',
                { parseAs: 'buffer' },
                (_request, body, done) => done(null, body)
            );
            scope.addContentTypeParser('*', { parseAs: 'buffer' }, (_request, body, done) => done(null, body));
            scope.post('/v1/speak', (request, reply) => this.#handle(request, reply));
            scope.post('/v1/listen', (request, reply) => this.#handle(request, reply));
            scope.get('/v1/models', (request, reply) => this.#handle(request, reply));
        });
    }
}
