import { InboundFrame } from '../contracts/gateway';
import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';

export const SOCKET = Symbol('gateway.socket');
export const PAYLOAD = Symbol('gateway.payload');

export interface GatewayContext extends FastifyRequest{
    [SOCKET]: WebSocket,
    [PAYLOAD]: InboundFrame;
}

export const createContext = (
    req: FastifyRequest,
    socket: WebSocket,
    payload: InboundFrame
): GatewayContext => {
    const ctx = Object.create(req) as GatewayContext;
    ctx[SOCKET] = socket;
    ctx[PAYLOAD] = payload;
    return ctx;
};
