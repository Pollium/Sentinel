import { HttpMethod } from '@sentinel/contracts/shared/routing';
import { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify';

export interface RouteDefinition{
    path: string;
    method: HttpMethod;
    handlerName: string | symbol;
}

export interface StatusBinding{
    handlerName: string | symbol;
    code: number;
}

export type Handler = (
    req: FastifyRequest<RouteGenericInterface>,
    reply: FastifyReply
) => unknown;