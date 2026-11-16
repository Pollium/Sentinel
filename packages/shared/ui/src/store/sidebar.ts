import { SidebarState } from '../contracts/sidebar';
import { readCollapsed, writeCollapsed } from '../utils/session/sidebar';
import { create } from 'zustand';

export const useSidebarStore = create<SidebarState>((set) => ({
    collapsed: readCollapsed(),
    toggle: () => set((state) => {
        const collapsed = !state.collapsed;
        writeCollapsed(collapsed);
        return { collapsed };
    })
}));
