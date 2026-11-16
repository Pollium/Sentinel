import { ProviderHealthChange } from '@sentinel/contracts/live/gateway';

declare global{
    interface EventMap{
        'providers.usage.recorded': null;
        'providers.failure.recorded': null;
        'providers.health.changed': ProviderHealthChange;
    }
}
