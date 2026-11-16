import { Theme } from '../../contracts/theme';

const KEY = 'sentinel.theme';
const SYSTEM_BARS = 'meta[name="theme-color"]';

export const resolveTheme = (): Theme => {
    const fromQuery = new URLSearchParams(window.location.search).get('theme');
    if(fromQuery === 'light' || fromQuery === 'dark') return fromQuery;

    const stored = localStorage.getItem(KEY);
    if(stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    localStorage.setItem(KEY, theme);

    const canvas = getComputedStyle(root).getPropertyValue('--canvas');
    document.querySelector(SYSTEM_BARS)?.setAttribute('content', canvas);
};

export const initTheme = () => applyTheme(resolveTheme());
