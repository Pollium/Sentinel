import SocketChannel from '../services/socket/SocketChannel';

export type ChannelStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface OutboundFrame{
    type?: string;
    data?: unknown;
}

export type MessageHandler<T> = (data: T) => void;

export interface ChannelHandlers{
    [type: string]: MessageHandler<unknown>;
}

export interface ChannelMap{}

export type HandlersFor<P extends string> = P extends keyof ChannelMap
    ? { [K in keyof ChannelMap[P]]?: MessageHandler<ChannelMap[P][K]> }
    : ChannelHandlers;

export interface ChannelApi{
    send: (type: string, data?: unknown) => boolean;
    status: ChannelStatus;
}

export type StatusHandler = (status: ChannelStatus) => void;

export interface PoolEntry{
    channel: SocketChannel;
    refs: number;
}
