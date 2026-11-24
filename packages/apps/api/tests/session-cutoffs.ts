import { sessionCutoffs } from '@pollium/readable/auth/sessions';
import { vi } from 'vitest';

const cutoffs = new Map<string, number>();

export const keepSessionCutoffsInMemory = () => {
    cutoffs.clear();
    vi.spyOn(sessionCutoffs, 'cutoffOf').mockImplementation(async (userId) => cutoffs.get(userId) ?? null);
    vi.spyOn(sessionCutoffs, 'cut').mockImplementation(async (userId) => {
        cutoffs.set(userId, Math.floor(Date.now() / 1000));
    });
};
