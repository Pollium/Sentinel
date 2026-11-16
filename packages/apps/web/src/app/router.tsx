import NotFound from '@/app/components/NotFound';
import TowerLayout from '@/app/layouts/TowerLayout';
import { assembleRouter } from '@sentinel/ui/utils/routing/assemble-router';
import { discoverRoutes } from '@/app/routes';

export const router = assembleRouter(discoverRoutes(), TowerLayout, NotFound);
