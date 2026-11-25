import { PageDetail } from '../../contracts/page-toolbar';
import { usePageToolbar } from '../../store/page-toolbar';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

interface PageToolbarProps{
    title: string;
    detail?: PageDetail;
    note?: string;
    children?: ReactNode;
}

const PageToolbar = ({ title, detail, note, children }: PageToolbarProps) => {
    const titleSlot = usePageToolbar((state) => state.titleSlot);
    const actionsSlot = usePageToolbar((state) => state.actionsSlot);
    if(titleSlot === null || actionsSlot === null) return null;

    return (
        <>
            {createPortal(
                <>
                    <nav aria-label='Breadcrumb' className='flex min-w-0 items-center gap-1.5 font-medium'>
                        {detail === undefined ? <h1 className='truncate text-foreground'>{title}</h1> : (
                            <>
                                <Link to={detail.parent} className='shrink-0 text-muted transition-colors hover:text-foreground motion-reduce:transition-none'>{title}</Link>
                                <span aria-hidden='true' className='text-subtle'>/</span>
                                <h1 className='truncate text-foreground'>{detail.label}</h1>
                            </>
                        )}
                    </nav>
                    {note === undefined ? null : <span className='hidden shrink-0 tabular-nums text-subtle sm:inline'>{note}</span>}
                </>,
                titleSlot
            )}
            {createPortal(children, actionsSlot)}
        </>
    );
};

export default PageToolbar;
