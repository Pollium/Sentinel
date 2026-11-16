const BASE_CODE = /^([^:]+::[^:]+)/;

export const baseCodeOf = (code: string): string => BASE_CODE.exec(code)?.[1] ?? code;

export interface ErrorTable{
    readonly domain: string;
    readonly causes: Readonly<Record<string, number>>;
}

export type ErrorCode<T extends ErrorTable> =
    `${T['domain']}::${Extract<keyof T['causes'], string>}`;

export const GatewayErrors = {
    domain: 'Gateway',
    causes: {
        MissingChannel: 500,
        MalformedFrame: 400,
        UnknownMessageType: 400,
        Internal: 500
    }
} as const satisfies ErrorTable;

export const RateLimitErrors = {
    domain: 'RateLimit',
    causes: {
        TooManyRequests: 429
    }
} as const satisfies ErrorTable;

export type RateLimitErrorCode = ErrorCode<typeof RateLimitErrors>;

export const RequestErrors = {
    domain: 'Request',
    causes: {
        InvalidId: 400,
        ValidationFailed: 400
    }
} as const satisfies ErrorTable;

export type RequestErrorCode = ErrorCode<typeof RequestErrors>;

export const ServerErrors = {
    domain: 'Server',
    causes: {
        Internal: 500
    }
} as const satisfies ErrorTable;

export type ServerErrorCode = ErrorCode<typeof ServerErrors>;
