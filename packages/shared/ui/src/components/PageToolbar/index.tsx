import { usePageToolbar } from '../../store/page-toolbar';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PageToolbarProps{
    title: ReactNode;
    children?: ReactNode;
}

const PageToolbar = ({ title, children }: PageToolbarProps) => {
    const slot = usePageToolbar((state) => state.slot);
    if(slot === null) return null;

    return createPortal(
        <>
            <h1 className='min-w-0 truncate text-[0.9375rem] font-semibold tracking-tight text-foreground'>{title}</h1>
            <div className='ms-auto flex shrink-0 items-center gap-2'>{children}</div>
        </>,
        slot
    );
};

export default PageToolbar;
