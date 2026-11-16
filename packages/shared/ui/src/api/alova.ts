import adapterFetch from 'alova/fetch';
import ReactHook from 'alova/react';
import { env } from '../config/env';
import { ApiError } from '../services/ApiError';
import { answerOf, NETWORK_FAILED } from './answer';
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

        method.config.headers['Content-Type'] = isJson ? 'application/json' : '';
    },

    responded: {
        async onSuccess(response){
            const payload = response.status === 204
                ? undefined
                : await response.json().catch(() => undefined);

            return answerOf(response.status, response.statusText, payload);
        },

        onError(error){
            if(error instanceof ApiError) throw error;
            throw new ApiError(0, NETWORK_FAILED, undefined, { cause: error });
        }
    }
});
