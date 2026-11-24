import { logger } from '@pollium/readable/app/logger';
import { GatewayOverview, UsageWindow } from '@sentinel/contracts/usage/domain';

export const OVERVIEW_PUSH_INTERVAL_MS = 2000;
export const LIVE_REFRESH_MS = 60_000;

type PushOverview = (window: UsageWindow) => Promise<GatewayOverview | null>;

interface Due{
    at: number;
    timer: ReturnType<typeof setTimeout>;
}

const holdsTraffic = (overview: GatewayOverview): boolean =>
    overview.live.inFlight > 0 || overview.live.minutes.some((minute) => minute.requests > 0 || minute.failedAttempts > 0);

export default class OverviewPushes{
    readonly #push: PushOverview;
    #due = new Map<UsageWindow, Due>();
    #running = new Set<UsageWindow>();
    #missed = new Set<UsageWindow>();

    constructor(push: PushOverview){
        this.#push = push;
    }

    changed(window: UsageWindow){
        if(this.#running.has(window)){
            this.#missed.add(window);
            return;
        }

        this.#dueIn(window, OVERVIEW_PUSH_INTERVAL_MS);
    }

    shown(window: UsageWindow, overview: GatewayOverview){
        if(this.#running.has(window) || !holdsTraffic(overview)) return;

        this.#dueIn(window, LIVE_REFRESH_MS);
    }

    #dueIn(window: UsageWindow, delayMs: number){
        const at = Date.now() + delayMs;
        const due = this.#due.get(window);
        if(due !== undefined && due.at <= at) return;

        clearTimeout(due?.timer);
        this.#due.set(window, {
            at,
            timer: setTimeout(() => void this.#run(window), delayMs)
        });
    }

    async #run(window: UsageWindow){
        this.#due.delete(window);
        this.#running.add(window);

        let overview: GatewayOverview | null = null;
        try{
            overview = await this.#push(window);
        }catch(cause: unknown){
            logger.error('tower overview push failed', cause, { scope: 'tower', window });
        }

        this.#running.delete(window);
        if(this.#missed.delete(window)){
            this.changed(window);
        }else if(overview !== null){
            this.shown(window, overview);
        }
    }
}
