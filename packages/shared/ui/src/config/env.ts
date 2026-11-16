export const env = {
    apiUrl: (import.meta.env.VITE_API_URL?.trim() || `${window.location.origin}/api`).replace(/\/+$/, '')
} as const;
