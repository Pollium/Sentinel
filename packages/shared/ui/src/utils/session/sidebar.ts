const KEY = 'sentinel.sidebar';

export const readCollapsed = (): boolean => {
    try{
        return localStorage.getItem(KEY) === 'collapsed';
    }catch{
        return false;
    }
};

export const writeCollapsed = (collapsed: boolean) => {
    try{
        if(collapsed) localStorage.setItem(KEY, 'collapsed');
        else localStorage.removeItem(KEY);
    }catch{
        return;
    }
};
