import { ReactNode } from 'react';

interface PaneHeaderProps{
    title: string;
    description?: ReactNode;
    children?: ReactNode;
}

const PaneHeader = ({ title, description, children }: PaneHeaderProps) => (
    <header className='flex items-start justify-between gap-4 px-5 pb-4.5 pt-5'>
        <div className='min-w-0'>
            <h2 className='break-words text-lg font-semibold tracking-tight text-foreground'>{title}</h2>
            {description === undefined ? null : <p className='mt-0.5 truncate text-muted'>{description}</p>}
        </div>
        {children}
    </header>
);

export default PaneHeader;
