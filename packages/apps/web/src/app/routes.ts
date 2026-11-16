import { DiscoveredRoute } from '@sentinel/ui/contracts/route';
import { discoverRoutes as fromModules } from '@sentinel/ui/utils/routing/discover-routes';

const modules = import.meta.glob([
    '/src/modules/*/pages/{guest,protected}/index.tsx',
    '/src/modules/*/pages/{guest,protected}/**/index.tsx',
    '/src/modules/*/pages/{guest,protected}/**/layout.tsx'
]);

export const discoverRoutes = (): DiscoveredRoute[] => fromModules(modules);
