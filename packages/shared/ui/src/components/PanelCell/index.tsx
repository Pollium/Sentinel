import { TONE_TEXT } from '../../utils/format/tone-text';
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
    const figureTone = tone !== undefined && attention === undefined ? TONE_TEXT[tone] : 'text-foreground';
    const heading = (
        <>
            <span className='block font-medium text-muted'>{title}</span>
            <span className={`mt-0.5 block text-[1.25rem] font-semibold leading-tight tracking-tight tabular-nums ${figureTone}`}>{figure}</span>
            <span className='mt-0.5 block text-[0.75rem] text-subtle'>{caption}</span>
        </>
    );

    return (
        <article className={`flex min-w-0 flex-col gap-3.5 px-5 pb-5.5 pt-4.5 shadow-[1px_0_0_var(--line),0_1px_0_var(--line)] transition-colors has-[>a:hover]:bg-raised motion-reduce:transition-none ${isWide ? '@2xl:col-span-2' : ''}`}>
            {to === undefined
                ? <header>{heading}</header>
                : <Link to={to} className='rounded-md outline-none focus-visible:ring-2 focus-visible:ring-foreground/30'>{heading}</Link>}
            {children}
            {tone === undefined || attention === undefined ? null : <p className={`text-[0.75rem] ${TONE_TEXT[tone]}`}>{attention}</p>}
        </article>
    );
};

export default PanelCell;
