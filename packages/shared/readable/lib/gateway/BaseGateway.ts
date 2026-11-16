import RuntimeError from '../errors/RuntimeError';
import ConnectionsRegistry from './ConnectionRegistry';
import { InboundFrame, OutboundMessage } from '../contracts/gateway';
import { getParamResolvers } from '../decorators/controllers/Params';
import { channelByGateway } from '../decorators/gateway/Channel';
import { handlersByGateway } from '../decorators/gateway/Gateway';
import { getClassMiddleware } from '../decorators/middleware/Middleware';
import { GatewayError } from '../errors/Gateway';
import { createContext } from './create-context';
import { logger } from '../utils/Logger';
import { ACCESS_REVOKED, SESSION_EXPIRED } from '@sentinel/contracts/shared/socket';
import { WebSocket } from '@fastify/websocket';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export const REAUTHORIZE_MS = 30_000;
export const CHECK_FAILED = 1011;
const SERVER_ERROR_STATUS = 500;

export default abstract class BaseGateway{
    protected readonly connections = new ConnectionsRegistry();
    
    #authorizations = new WeakMap<FastifyRequest, () => Promise<void>>();
    #messageHandlers = new Map<string, string | symbol>();

    register(app: FastifyInstance){
        const path = channelByGateway.get(this.constructor);
        if(!path) throw GatewayError.MissingChannel();

        this.#indexHandlers();
        const guards = getClassMiddleware(this.constructor);

        app.get(path, {
            websocket: true,
            preValidation: async (req: FastifyRequest, reply: FastifyReply) => {
                const authorize = async () => {
                    for(const guard of guards) await guard(req, reply);
                };
                await authorize();
                this.#authorizations.set(req, authorize);
            }
        }, (socket, req) => this.#onConnection(socket, req));
    }

    #indexHandlers(){
        for(const { type, handlerName } of handlersByGateway.get(this.constructor)){
            this.#messageHandlers.set(type, handlerName);
        }
    }

    #onConnection(socket: WebSocket, req: FastifyRequest){
        const disconnected = new AbortController();
        this.connections.add(socket);
        const expiry = this.#closeOnExpiry(socket, req);
        const reauthorizing = setInterval(() => {
            void this.#reauthorize(socket, req);
        }, REAUTHORIZE_MS);

        socket.on('message', (raw: Buffer) => {
            void this.#dispatch(socket, req, raw.toString(), disconnected.signal);
        });

        socket.on('close', () => {
            clearTimeout(expiry);
            clearInterval(reauthorizing);
            disconnected.abort();
            this.connections.remove(socket);
        });
    }

    #closeOnExpiry(socket: WebSocket, req: FastifyRequest): ReturnType<typeof setTimeout> | undefined{
        if(req.sessionExpiresAt === undefined) return undefined;

        return setTimeout(() => socket.close(SESSION_EXPIRED, 'session expired'), req.sessionExpiresAt * 1000 - Date.now());
    }

    async #reauthorize(socket: WebSocket, req: FastifyRequest){
        try{
            await this.#authorizations.get(req)?.();
        }catch(error){
            this.#closeAfterFailedCheck(socket, error);
        }
    }

    #closeAfterFailedCheck(socket: WebSocket, error: unknown){
        if(error instanceof RuntimeError && error.statusCode < SERVER_ERROR_STATUS){
            socket.close(ACCESS_REVOKED, 'access revoked');
            return;
        }

        logger.error('Gateway::CheckFailed', error, { scope: 'gateway' });
        socket.close(CHECK_FAILED, 'check failed');
    }

    async #dispatch(socket: WebSocket, req: FastifyRequest, raw: string, disconnected: AbortSignal){
        const frame = this.#parseFrame(raw);
        if(!frame){
            this.#sendError(socket, GatewayError.MalformedFrame());
            return;
        }

        const handlerName = this.#messageHandlers.get(frame.type);
        if(handlerName === undefined){
            this.#sendError(socket, GatewayError.UnknownMessageType());
            return;
        }

        try{
            const result = await this.#invoke(handlerName, socket, req, frame);
            if(result !== undefined && result !== null){
                this.#send(socket, {
                    type: frame.type,
                    data: result
                });
            }
        }catch(error){
            if(disconnected.aborted) return;
            this.#handleError(socket, error);
        }
    }

    #parseFrame(raw: string): InboundFrame | undefined{
        try{
            const frame = JSON.parse(raw) as InboundFrame;
            return typeof frame?.type === 'string' ? frame : undefined;
        }catch{
            return undefined;
        }
    }

    async #invoke(
        handlerName: string | symbol,
        socket: WebSocket,
        req: FastifyRequest,
        frame: InboundFrame
    ): Promise<unknown>{
        const ctx = createContext(req, socket, frame);
        const resolvers = getParamResolvers(this.constructor, handlerName);
        const args = await Promise.all(resolvers.map((resolve) => resolve(ctx)));

        const method = Reflect.get(this, handlerName) as (...args: unknown[]) => unknown;
        return method.apply(this, args);
    }

    #handleError(socket: WebSocket, error: unknown){
        if(error instanceof RuntimeError){
            this.#sendError(socket, error);
            return;
        }

        this.#sendError(socket, GatewayError.Internal());
    }

    #send(socket: WebSocket, message: OutboundMessage<unknown>){
        socket.send(JSON.stringify(message));
    }

    #sendError(socket: WebSocket, error: RuntimeError){
        socket.send(JSON.stringify({ error: error.message }));
    }
}
