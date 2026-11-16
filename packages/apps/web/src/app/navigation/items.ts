import { Boxes, KeyRound, LayoutDashboard, Server, Users } from 'lucide-react';
import { SVGProps, ReactNode } from 'react';

interface NavEntry{
    label: string;
    to: string;
    icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
}

export const NAV_ENTRIES: NavEntry[] = [
    { label: 'Overview', to: '/overview', icon: LayoutDashboard },
    { label: 'Providers', to: '/providers', icon: Server },
    { label: 'Models', to: '/models', icon: Boxes }
];

export const FOOTER_ENTRIES: NavEntry[] = [
    { label: 'API keys', to: '/keys', icon: KeyRound },
    { label: 'Operators', to: '/operators', icon: Users }
];
