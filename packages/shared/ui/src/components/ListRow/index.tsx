import { ComponentPropsWithRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ListRowProps extends Omit<ComponentPropsWithRef<typeof Link>, 'to' | 'className' | 'children'>{
    to: string;
    label: string;
    isSelected: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
}

const ListRow = ({ to, label, isSelected, leading, trailing, ...link }: ListRowProps) => (
    <Link
        {...link}
        to={to}
        aria-current={isSelected ? 'page' : undefined}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left transition-colors ${isSelected ? 'bg-foreground/[0.06]' : 'hover:bg-foreground/[0.03]'}`}
    >
        {leading}
        <span className='min-w-0 flex-1 truncate text-[0.8125rem] text-foreground'>{label}</span>
        {trailing}
    </Link>
);

export default ListRow;
