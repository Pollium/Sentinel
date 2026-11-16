import { SessionCutoffStore } from '@readable/contracts/session';

const cutoffs = new Map<string, number>();

export const clearSessionCutoffs = () => cutoffs.clear();

export default class MemorySessionCutoffStore implements SessionCutoffStore{
    async cutoffOf(userId: string): Promise<number | null>{
        return cutoffs.get(userId) ?? null;
    }

    async cut(userId: string){
        cutoffs.set(userId, Math.floor(Date.now() / 1000));
    }
}
