import { PageToolbarState } from '../contracts/page-toolbar';
import { create } from 'zustand';

export const usePageToolbar = create<PageToolbarState>((set) => ({
    slot: null,
    setSlot: (slot) => set({ slot })
}));
