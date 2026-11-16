import ClassMetadata from '../../utils/ClassMetadata';
import { GatewayHandler } from '../../contracts/gateway';

export const handlersByGateway = new ClassMetadata<GatewayHandler>();

export const OnMessage = (type: string): MethodDecorator => {
    return (target, handlerName) => {
        handlersByGateway.append(target.constructor, { type, handlerName });
    };
};
