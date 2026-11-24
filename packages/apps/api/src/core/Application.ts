import websocket from '@fastify/websocket';
import Application from '@pollium/readable/app/Application';
import { websocketOptions } from '@pollium/readable/gateway/Gateway';
import { createDataSource } from '@pollium/readable/database/data-source';
import { discoverFrom } from '@pollium/readable/app/discovery';
import { config } from '@/shared/config';

const createApp = () => new Application({
    port: config.port,
    corsOrigins: [...config.corsOrigins],
    log: config.log,
    discover: () => discoverFrom(import.meta.url, (url) => import(url)),
    createDataSource: (entities) => createDataSource(config.database, entities),
    plugins: async (app) => {
        await app.register(websocket, websocketOptions);
    }
});

export default createApp;
