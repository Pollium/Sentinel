import { SessionState } from '../contracts/session';
import { onStoredToken, readToken, writeToken } from '../utils/session/session';
import { create } from 'zustand';

export const useSessionStore = create<SessionState>((set, get) => ({
    token: readToken(),
    setToken: (token) => {
        writeToken(token);
        set({ token });
    },
    clear: (token) => {
        if(readToken() === token) writeToken(null);
        if(get().token === token) set({ token: readToken() });
    }
}));

onStoredToken((token) => useSessionStore.setState({ token }));
