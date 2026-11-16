export const requestAuth = (token: string | null): Record<string, string> =>
    token ? { Authorization: `Bearer ${token}` } : {};
