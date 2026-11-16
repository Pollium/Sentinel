const KEY = 'sentinel.session';

export const readToken = (): string | null => {
    try{
        return localStorage.getItem(KEY);
    }catch{
        return null;
    }
};

export const onStoredToken = (listener: (token: string | null) => void) => {
    if(typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
        if(event.key === KEY || event.key === null) listener(readToken());
    });
};

export const writeToken = (token: string | null) => {
    try{
        if(token === null) localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, token);
    }catch{
        return;
    }
};
