interface NavEntry{
    label: string;
    to: string;
}

export const NAV_ENTRIES: NavEntry[] = [
    { label: 'Overview', to: '/overview' },
    { label: 'Providers', to: '/providers' },
    { label: 'Models', to: '/models' },
    { label: 'API keys', to: '/keys' },
    { label: 'Operators', to: '/operators' }
];
