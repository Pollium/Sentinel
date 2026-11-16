import adapterFetch from 'alova/fetch';
import ReactHook from 'alova/react';
import { env } from '../config/env';
import { ApiError } from '../services/ApiError';
import { answerOf, NETWORK_FAILED } from './answer';
import { requestAuth } from './request-auth';
import { useSessionStore } from '../store/session';
import { createAlova } from 'alova';

export const alova = createAlova({
    baseURL: env.apiUrl,
    requestAdapter: adapterFetch(),
    statesHook: ReactHook,
    cacheFor: {
        GET: 30_000
    },

    beforeRequest(method){
        const isJson = method.data !== undefined;
        const token = useSessionStore.getState().token;

        method.config.headers['Content-Type'] = isJson ? 'application/json' : '';
        method.meta = { token };
        Object.assign(method.config.headers, requestAuth(token));
    },

    responded: {
        async onSuccess(response, method){
            const payload = response.status === 204
                ? undefined
                : await response.json().catch(() => undefined);

            return answerOf(response.status, response.statusText, payload, method.meta?.token ?? null);
        },

        onError(error){
            if(error instanceof ApiError) throw error;
            throw new ApiError(0, NETWORK_FAILED, undefined, { cause: error });
        }
    }
});
