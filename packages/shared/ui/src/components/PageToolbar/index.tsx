import { usePageToolbar } from '../../store/page-toolbar';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PageToolbarProps{
    title: ReactNode;
    children?: ReactNode;
}

const PageToolbar = ({ title, children }: PageToolbarProps) => {
    const titleSlot = usePageToolbar((state) => state.titleSlot);
    const actionsSlot = usePageToolbar((state) => state.actionsSlot);
    if(titleSlot === null || actionsSlot === null) return null;

    return (
        <>
            {createPortal(
                <h1 className='min-w-0 truncate text-[0.9375rem] font-semibold tracking-tight text-foreground'>{title}</h1>,
                titleSlot
            )}
            {createPortal(children, actionsSlot)}
        </>
    );
};

export default PageToolbar;
