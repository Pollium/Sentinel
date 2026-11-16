export const safePath = (next: string | null | undefined): string =>
    next !== null && next !== undefined && next.startsWith('/') && !next.startsWith('//') ? next : '/';
