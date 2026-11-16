export interface InboundFrame{
    type: string;
    [field: string]: unknown;
}

export interface OutboundMessage<T>{
    type: string;
    data: T;
}

export type RoomAccess = () => Promise<unknown>;

export interface GatewayHandler{
    type: string;
    handlerName: string | symbol;
}
