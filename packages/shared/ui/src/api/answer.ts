import { ApiError as ApiErrorPayload, ApiResponse } from '@sentinel/contracts/shared/http';
import { ApiError } from '../services/ApiError';
import { endSession, isSessionExpired } from '../services/end-session';

export const NETWORK_FAILED = 'Network request failed';

const SUCCESS_FLOOR = 200;
const SUCCESS_CEILING = 300;

export const answerOf = async (status: number, statusText: string, payload: unknown, token: string | null): Promise<unknown> => {
    if(status >= SUCCESS_FLOOR && status < SUCCESS_CEILING) return (payload as ApiResponse<unknown> | undefined)?.data;

    const message = (payload as ApiErrorPayload | undefined)?.error ?? statusText;
    if(isSessionExpired(status, message)) await endSession(token);

    throw new ApiError(status, message, payload);
};
