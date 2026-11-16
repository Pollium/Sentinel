import { FastifyReply, FastifyRequest } from 'fastify';

export type MiddlewareFn = (
    req: FastifyRequest, 
    reply: FastifyReply
) => void | Promise<void>;
