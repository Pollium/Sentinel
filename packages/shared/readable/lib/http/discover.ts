import ModuleDiscovery, { Discovered } from '../services/ModuleDiscovery';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const discoverFrom = (metaUrl: string): Promise<Discovered> =>
    new ModuleDiscovery(join(dirname(fileURLToPath(metaUrl)), '..', 'modules')).discover();
