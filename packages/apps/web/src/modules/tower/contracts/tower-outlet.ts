import { GatewayOverview } from '@sentinel/contracts/usage/domain';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { Query } from '@sentinel/ui/contracts/api';

export interface TowerOutlet{
    providers: Query<PublicGatewayProvider[]>;
    overview: Query<GatewayOverview>;
}

export interface KeysOutlet{
    keys: Query<PublicGatewayApiKey[]>;
    overview: Query<GatewayOverview>;
}
