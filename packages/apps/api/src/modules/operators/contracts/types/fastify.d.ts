import Operator from '../../models/Operator';

declare module 'fastify'{
    interface FastifyRequest{
        operator?: Operator;
    }
}
