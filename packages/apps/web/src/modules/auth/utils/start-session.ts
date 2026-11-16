import { Session } from '@sentinel/contracts/auth/domain';
import { useSessionStore } from '@sentinel/ui/store/session';
import { invalidateCache } from 'alova';

export const startSession = async (session: Session) => {
    await invalidateCache();
    useSessionStore.getState().setToken(session.token);
};
