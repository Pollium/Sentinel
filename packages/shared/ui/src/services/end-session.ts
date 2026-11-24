import { AuthErrorCode } from '@sentinel/contracts/auth/errors';
import { baseCodeOf } from '@pollium/readable-contracts/errors';
import { useSessionStore } from '../store/session';
import { invalidateCache } from 'alova';

const EXPIRED_CODES: AuthErrorCode[] = ['Auth::Unauthorized', 'Auth::InvalidToken'];

export const isSessionExpired = (status: number, code: string): boolean =>
    status === 401 && EXPIRED_CODES.includes(baseCodeOf(code) as AuthErrorCode);

export const endSession = async (token: string | null) => {
    await invalidateCache();
    useSessionStore.getState().clear(token);
};
