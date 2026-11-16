import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import RuntimeError from '../errors/RuntimeError';
import ValidationError from '../errors/Validation';
import BaseController from '../controllers/BaseController';
import BaseGateway from '../gateway/BaseGateway';
import { ApiError } from '@sentinel/contracts/shared/http';
import { HttpMethod } from '@sentinel/contracts/shared/routing';
import { LogLevel } from '../contracts/logging';
import { RateLimitError } from '../errors/RateLimit';
import { ServerError } from '../errors/Server';
import { eventBus } from '../events/EventBus';
import { Discovered } from '../services/ModuleDiscovery';
import { redis } from '../redis/RedisClient';
import { logger } from '../utils/Logger';
import Fastify, { LogController, FastifyInstance, FastifyBaseLogger } from 'fastify';
import { DataSource } from 'typeorm';

interface ApplicationLog{
    level: string;
    pretty: boolean;
}

interface ApplicationOptions{
    port: number;
    corsOrigins: string[];
    log: ApplicationLog;
    discover: () => Promise<Discovered>;
    createDataSource: (entities: Function[]) => DataSource;
    plugins?: (app: FastifyInstance) => Promise<void>;
}

const CORS_METHODS: HttpMethod[] = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'];
const PRIVATE_NETWORKS = ['loopback', 'linklocal', 'uniquelocal'];
const RATE_LIMIT_NAMESPACE = 'rl:';

export default class Application{
    #app!: FastifyInstance;
    #dataSource!: DataSource;
    #options: ApplicationOptions;

    constructor(options: ApplicationOptions){
        this.#options = options;
    }

    get dataSource(): DataSource{
        return this.#dataSource;
    }

    async build(): Promise<FastifyInstance>{
        logger.configure({
            level: this.#options.log.level as LogLevel,
            pretty: this.#options.log.pretty
        });
        this.#app = Fastify({
            loggerInstance: logger.raw as FastifyBaseLogger,
            logController: new LogController({ disableRequestLogging: true }),
            trustProxy: PRIVATE_NETWORKS
        });

        await this.#app.register(cors, {
            origin: this.#options.corsOrigins,
            credentials: true,
            methods: CORS_METHODS
        });
        await this.#app.register(rateLimit, {
            global: false,
            redis,
            nameSpace: RATE_LIMIT_NAMESPACE,
            errorResponseBuilder: () => RateLimitError.TooManyRequests()
        });
        if(this.#options.plugins) await this.#options.plugins(this.#app);

        const discovered = await this.#options.discover();

        this.#dataSource = this.#options.createDataSource(discovered.entities);
        await this.#dataSource.initialize();

        this.#registerErrorHandler();
        this.#registerRequestLogging();
        await this.#mountControllers(discovered.controllers);
        this.#app.get('/health', async () => ({ status: 'ok' }));
        this.#mountGateways(discovered.gateways);

        return this.#app;
    }

    async start(){
        await this.build();
        await this.#app.listen({ port: this.#options.port, host: '0.0.0.0' });
    }

    async stop(){
        await this.#app.close();
        await eventBus.close();
        await this.#dataSource.destroy();
    }

    #registerErrorHandler(){
        this.#app.setErrorHandler((err, req, reply) => {
            const answer = err instanceof RuntimeError ? err : ServerError.Internal();

            if(answer.statusCode >= 500){
                logger.error(`${req.method} ${req.url}`, err, { scope: 'http', statusCode: answer.statusCode });
            }

            const payload: ApiError = { error: answer.message };
            if(err instanceof ValidationError) payload.errors = err.errors;

            reply.status(answer.statusCode).send(payload);
        });
    }

    #registerRequestLogging(){
        this.#app.addHook('onResponse', (req, reply, done) => {
            logger.debug(`${req.method} ${req.url}`, {
                scope: 'http',
                statusCode: reply.statusCode,
                ms: Math.round(reply.elapsedTime)
            });
            done();
        });
    }

    async #mountControllers(controllers: Array<new () => BaseController>){
        for(const Controller of controllers){
            await new Controller().register(this.#app);
        }
    }

    #mountGateways(gateways: Array<new () => BaseGateway>){
        for(const Gateway of gateways){
            new Gateway().register(this.#app);
        }
    }
}
