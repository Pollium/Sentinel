import ClassMetadata from '../../utils/ClassMetadata';
import { MiddlewareFn } from '../../contracts/middleware';

export type { MiddlewareFn };

const middlewareByClass = new ClassMetadata<MiddlewareFn>();

export const Middleware = (...middleware: MiddlewareFn[]): ClassDecorator => {
    return (target) => {
        for(const fn of middleware) middlewareByClass.append(target, fn);
    };
};

export const getClassMiddleware = (ctor: object): MiddlewareFn[] => middlewareByClass.get(ctor);
