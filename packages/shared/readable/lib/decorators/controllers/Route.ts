import ClassMetadata from '../../utils/ClassMetadata';
import { Endpoint } from '@sentinel/contracts/shared/routing';
import { RouteDefinition } from '../../contracts/routing';

export const routesByController = new ClassMetadata<RouteDefinition>();

export const Route = <I, O>(endpoint: Endpoint<I, O>): MethodDecorator => {
    return (target, handlerName) => {
        routesByController.append(target.constructor, { path: endpoint.path, method: endpoint.method, handlerName });
    };
};
