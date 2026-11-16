import { towerGateway, TowerFrames } from '@sentinel/contracts/live/gateway';

declare module '@sentinel/ui/contracts/channel'{
    interface ChannelMap{
        [towerGateway.channel]: TowerFrames;
    }
}
