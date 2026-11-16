import ClassMetadata from '../../utils/ClassMetadata';
import { RateLimitOptions as RouteRateLimit } from '@fastify/rate-limit';
import { RateLimitBinding, RateLimitOptions } from '../../contracts/rate-limit';

const limitsByHandler = new ClassMetadata<RateLimitBinding>();

export const RateLimit = ({ max, window }: RateLimitOptions): MethodDecorator => {
    return (target, handlerName) => {
        limitsByHandler.append(target.constructor, { handlerName, limit: { max, timeWindow: window } });
    };
};

export const getRateLimit = (
    ctor: object,
    handlerName: string | symbol
): RouteRateLimit | undefined => {
    return limitsByHandler
        .get(ctor)
        .find((binding) => binding.handlerName === handlerName)?.limit;
};
