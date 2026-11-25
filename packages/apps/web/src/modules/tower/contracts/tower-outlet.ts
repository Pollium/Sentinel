import { GatewayOverview } from '@sentinel/contracts/usage/domain';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { Query } from '@pollium/readable-react/query/useQuery';

export type LiveProviders = Omit<Query<PublicGatewayProvider[]>, 'set'>;

export interface TowerOutlet{
    providers: LiveProviders;
    overview: Query<GatewayOverview>;
}

export interface KeysOutlet{
    keys: Query<PublicGatewayApiKey[]>;
    overview: Query<GatewayOverview>;
}
