import createApp from '@/core/Application';
import { useApp as useSharedApp, TestApp } from '@readable/testing/harness';
import { config } from '@/shared/config';
import { completionCeiling } from '@/modules/chat/services/CompletionCeiling';
import { providerHealth } from '@/modules/providers/services/pool/ProviderHealth';
import { clearSessionCutoffs } from './session-cutoffs';

export const useApp = (): TestApp => useSharedApp({
    createApp,
    schema: config.database.schema,
    onBeforeEach: () => {
        providerHealth.reset();
        completionCeiling.reset();
        clearSessionCutoffs();
    }
});
