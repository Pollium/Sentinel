import { ThemeState } from '../contracts/theme';
import { applyTheme, resolveTheme } from '../utils/session/theme';
import { create } from 'zustand';

export const useThemeStore = create<ThemeState>((set) => ({
    theme: resolveTheme(),
    toggle: () => set((state) => {
        const theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(theme);

        return { theme };
    })
}));
