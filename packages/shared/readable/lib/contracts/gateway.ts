export interface InboundFrame{
    type: string;
    [field: string]: unknown;
}

export interface OutboundMessage<T>{
    type: string;
    data: T;
}

export interface Recipient{
    send(raw: string): void;
}

export interface GatewayHandler{
    type: string;
    handlerName: string | symbol;
}
