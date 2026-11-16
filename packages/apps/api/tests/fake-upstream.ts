import Fastify from 'fastify';

interface FakeRoute{
    method: 'GET' | 'POST';
    path: string;
}

interface ScriptedResponse{
    status: number;
    json?: unknown;
    sse?: string;
    raw?: { body: Buffer; contentType: string };
    afterMs?: number;
}

interface RecordedCall{
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
}

export default class FakeUpstream{
    readonly calls: RecordedCall[] = [];

    #app = Fastify({ logger: false });
    #queue: ScriptedResponse[] = [];
    #baseUrl = '';

    get baseUrl(): string{
        return this.#baseUrl;
    }

    constructor(routes: FakeRoute[]){
        this.#app.addContentTypeParser('*', { parseAs: 'buffer' }, (request, body, done) => {
            done(null, body);
        });

        for(const route of routes){
            this.#app.route({
                method: route.method,
                url: route.path,
                handler: async (request, reply) => {
                    this.calls.push({
                        method: request.method,
                        url: request.url,
                        headers: { ...request.headers },
                        body: request.body
                    });

                    const next = this.#queue.shift();
                    if(next === undefined){
                        return reply.status(500).send({ error: 'no scripted response' });
                    }

                    if(next.afterMs !== undefined) await new Promise((resolve) => setTimeout(resolve, next.afterMs));

                    if(next.sse !== undefined){
                        reply.header('content-type', 'text/event-stream');
                        return reply.status(next.status).send(next.sse);
                    }

                    if(next.raw !== undefined){
                        reply.header('content-type', next.raw.contentType);
                        return reply.status(next.status).send(next.raw.body);
                    }

                    return reply.status(next.status).send(next.json);
                }
            });
        }
    }

    enqueue(next: ScriptedResponse){
        this.#queue.push(next);
    }

    reset(){
        this.calls.length = 0;
        this.#queue = [];
    }

    async start(){
        await this.#app.listen({ port: 0, host: '127.0.0.1' });
        const address = this.#app.server.address();
        if(address === null || typeof address === 'string'){
            throw new Error('fake upstream is not listening');
        }

        this.#baseUrl = `http://127.0.0.1:${address.port}`;
    }

    async stop(){
        await this.#app.close();
    }
}
