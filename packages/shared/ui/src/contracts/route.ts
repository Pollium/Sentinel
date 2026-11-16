import { ComponentType } from 'react';

export type RouteTier = 'guest' | 'protected';

type RouteKind = 'page' | 'layout';

interface PageModule{
    default: ComponentType;
}

export type PageLoader = () => Promise<PageModule>;

export interface ParsedRoute{
    tier: RouteTier;
    kind: RouteKind;
    path: string;
}

export interface DiscoveredRoute extends ParsedRoute{
    load: PageLoader;
}
