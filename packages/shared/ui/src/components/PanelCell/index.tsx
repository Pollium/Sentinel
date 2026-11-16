import StatusDot from '../StatusDot';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PanelCellProps{
    title: string;
    figure: string;
    caption: string;
    tone?: 'danger' | 'warning';
    attention?: string;
    to?: string;
    isWide?: boolean;
    children?: ReactNode;
}

const PanelCell = ({ title, figure, caption, tone, attention, to, isWide = false, children }: PanelCellProps) => {
    const heading = (
        <>
            <span className='min-w-0'>
                <span className='flex items-center gap-2 text-[0.8125rem] text-muted'>
                    {title}
                    {tone === undefined ? null : <StatusDot tone={tone} label={attention} />}
                </span>
                <span className='mt-1 block text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground'>{figure}</span>
                <span className='mt-0.5 block text-[0.75rem] text-muted'>{caption}</span>
            </span>
            {to === undefined ? null : <ChevronRight className='mt-0.5 size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100' aria-hidden='true' />}
        </>
    );

    return (
        <article className={`flex min-w-0 flex-col gap-5 border-t border-foreground/[0.08] pt-5 ${isWide ? '@2xl:col-span-2' : ''}`}>
            {to === undefined
                ? <header className='flex items-start justify-between gap-3'>{heading}</header>
                : <Link to={to} className='group flex items-start justify-between gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-foreground/30'>{heading}</Link>}
            {children}
        </article>
    );
};

export default PanelCell;
