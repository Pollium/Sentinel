export interface PageToolbarState{
    titleSlot: HTMLElement | null;
    actionsSlot: HTMLElement | null;
    setTitleSlot: (slot: HTMLElement | null) => void;
    setActionsSlot: (slot: HTMLElement | null) => void;
}

export interface PageDetail{
    label: string;
    parent: string;
}
