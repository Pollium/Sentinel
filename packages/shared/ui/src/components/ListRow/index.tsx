import { ComponentPropsWithRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ListRowProps extends Omit<ComponentPropsWithRef<typeof Link>, 'to' | 'className' | 'children'>{
    to: string;
    label: string;
    isSelected: boolean;
    trailing?: ReactNode;
}

const ListRow = ({ to, label, isSelected, trailing, ...link }: ListRowProps) => (
    <Link
        {...link}
        to={to}
        aria-current={isSelected ? 'page' : undefined}
        className={`mx-1.5 flex h-8 items-center gap-2.5 rounded-md px-2 font-medium transition-colors motion-reduce:transition-none ${isSelected ? 'bg-selected text-foreground' : 'text-muted hover:bg-selected hover:text-foreground'}`}
    >
        <span className='min-w-0 flex-1 truncate'>{label}</span>
        {trailing === undefined ? null : <span className='flex shrink-0 items-center text-[0.75rem] tabular-nums text-subtle'>{trailing}</span>}
    </Link>
);

export default ListRow;
