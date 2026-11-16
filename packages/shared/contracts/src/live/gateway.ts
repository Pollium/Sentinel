import { GatewayProviderHealth } from '../providers/domain';
import { GatewayOverview, UsageWindow } from '../usage/domain';

export const towerGateway = {
    channel: '/tower/live',
    room: (window: UsageWindow) => `tower:overview:${window}`
} as const;

export interface TowerWatchPayload{
    window: UsageWindow;
}

export interface ProviderHealthChange{
    providerId: string;
    health: GatewayProviderHealth;
}

interface TowerWatchFrame{
    type: 'tower.watch';
    data: GatewayOverview;
}

export interface TowerOverviewFrame{
    type: 'tower.overview';
    data: GatewayOverview;
}

export interface TowerProviderHealthFrame{
    type: 'tower.provider.health';
    data: ProviderHealthChange;
}

export type TowerFrame = TowerWatchFrame | TowerOverviewFrame | TowerProviderHealthFrame;

export type TowerFrames = {
    [T in TowerFrame['type']]: Extract<TowerFrame, { type: T }>['data'];
};
