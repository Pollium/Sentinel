import { PageToolbarState } from '../contracts/page-toolbar';
import { create } from 'zustand';

export const usePageToolbar = create<PageToolbarState>((set) => ({
    titleSlot: null,
    actionsSlot: null,
    setTitleSlot: (titleSlot) => set({ titleSlot }),
    setActionsSlot: (actionsSlot) => set({ actionsSlot })
}));
