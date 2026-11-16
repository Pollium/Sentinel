import { logger } from '../utils/Logger';

interface ListenTarget{
    start(): Promise<void>;
    stop(): Promise<void>;
}

export const listen = (app: ListenTarget) => {
    app.start().catch((err) => {
        logger.error('Failed to start server', err);
        process.exit(1);
    });

    for(const signal of ['SIGTERM', 'SIGINT'] as const){
        process.on(signal, () => {
            app.stop().finally(() => process.exit(0));
        });
    }
};
