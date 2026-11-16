import { Handler } from '../contracts/routing';
import { getParamResolvers } from '../decorators/controllers/Params';
import { routesByController } from '../decorators/controllers/Route';
import { getStatus } from '../decorators/controllers/Status';
import { getClassMiddleware } from '../decorators/middleware/Middleware';
import { getRateLimit } from '../decorators/middleware/RateLimit';
import { FastifyInstance } from 'fastify';

export default abstract class BaseController{
    async register(app: FastifyInstance){
        const middlewares = getClassMiddleware(this.constructor);

        for(const route of routesByController.get(this.constructor)){
            app.route({
                method: route.method,
                url: route.path,
                config: { rateLimit: getRateLimit(this.constructor, route.handlerName) },
                preHandler: middlewares.map((mw) => async (req, reply) => await mw(req, reply)),
                handler: this.#wrap(route.handlerName)
            });
        }
    }

    #wrap(handlerName: string | symbol): Handler{
        const method = (Reflect.get(this, handlerName) as (...args: unknown[]) => unknown).bind(this);
        const override = getStatus(this.constructor, handlerName);
        const resolvers = getParamResolvers(this.constructor, handlerName);

        return async (req, reply) => {
            const boxes = await Promise.all(Array.from(resolvers, async (resolve) => {
                const arg = resolve === undefined ? undefined : resolve(req, reply);
                return { arg: arg instanceof Promise ? await arg : arg };
            }));
            const result = await method(...boxes.map((box) => box.arg));

            if(reply.sent) return;

            if(result === undefined || result === null){
                return reply.status(override ?? 204).send();
            }

            return reply.status(override ?? 200).send({ data: result });
        };
    }
}
