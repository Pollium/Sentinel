import GuestGuard from '../../components/GuestGuard';
import SessionGate from '../../components/SessionGate';
import { DiscoveredRoute, RouteTier } from '../../contracts/route';
import { toRoutes } from './to-routes';
import { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';

export const assembleRouter = (discovered: DiscoveredRoute[], Layout: ComponentType, NotFound: ComponentType) => {
    const byTier = (tier: RouteTier): DiscoveredRoute[] => discovered.filter((route) => route.tier === tier);

    return createBrowserRouter([
        {
            element: <GuestGuard />,
            children: toRoutes(byTier('guest'))
        },
        {
            element: <SessionGate />,
            children: [{ element: <Layout />, children: toRoutes(byTier('protected')) }]
        },
        {
            path: '*',
            element: <NotFound />
        }
    ]);
};
