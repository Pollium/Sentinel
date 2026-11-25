import { Session } from '@sentinel/contracts/auth/domain';
import { session } from '@pollium/readable-react/session/session';
import { invalidateCache } from 'alova';

export const startSession = async ({ token }: Session) => {
    await invalidateCache();
    session.start(token);
};
