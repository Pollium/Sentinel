import OverviewPushes from '../services/OverviewPushes';
import OverviewService from '../services/Overview';
import BaseGateway, {
    Channel,
    OnMessage,
    Payload,
    Socket
} from '@pollium/readable/gateway/Gateway';
import { CurrentUser } from '@pollium/readable/auth/params';
import { Middleware } from '@pollium/readable/http/middleware';
import { eventBus } from '@pollium/readable/events/EventBus';
import { GatewayOverview, UsageWindow, usageWindowOf } from '@sentinel/contracts/usage/domain';
import { ProviderHealthChange, towerGateway, TowerOverviewFrame, TowerProviderHealthFrame, TowerWatchPayload } from '@sentinel/contracts/live/gateway';
import { operatorOf } from '@/modules/operators/middlewares/OperatorRoute';
import { OperatorSocketRoute } from '@/modules/operators/middlewares/OperatorSocketRoute';
import { WebSocket } from '@fastify/websocket';

@Channel(towerGateway.channel)
@Middleware(OperatorSocketRoute)
export default class TowerGateway extends BaseGateway{
    #overview = new OverviewService();
    #pushes = new OverviewPushes((window) => this.#pushOverview(window));

    constructor(){
        super();

        eventBus.on('providers.usage.recorded', () => this.#usageRecorded());
        eventBus.on('providers.failure.recorded', () => this.#usageRecorded());
        eventBus.on('providers.health.changed', (change) => this.#pushHealth(change));
    }

    @OnMessage('tower.watch')
    async watch(
        @CurrentUser() operatorId: string,
        @Payload() payload: TowerWatchPayload,
        @Socket() socket: WebSocket
    ): Promise<GatewayOverview>{
        await operatorOf(operatorId);
        const window = usageWindowOf(payload.window);

        this.connections.leaveAll(socket);
        this.connections.join(socket, towerGateway.room(window));

        const overview = await this.#overview.read(window);
        this.#pushes.shown(window, overview);
        return overview;
    }

    #usageRecorded(){
        for(const window of Object.values(UsageWindow)){
            if(this.connections.has(towerGateway.room(window))) this.#pushes.changed(window);
        }
    }

    async #pushOverview(window: UsageWindow): Promise<GatewayOverview | null>{
        const room = towerGateway.room(window);
        if(!this.connections.has(room)) return null;

        const frame: TowerOverviewFrame = {
            type: 'tower.overview',
            data: await this.#overview.read(window)
        };

        this.connections.sendToRoom(room, frame);
        return frame.data;
    }

    #pushHealth(change: ProviderHealthChange){
        const frame: TowerProviderHealthFrame = {
            type: 'tower.provider.health',
            data: change
        };

        this.connections.broadcast(frame);
    }
}
