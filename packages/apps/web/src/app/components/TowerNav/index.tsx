import { NAV_ENTRIES } from '@/app/navigation/items';
import { prefetchPage } from '@pollium/readable-react/pages/prefetch';
import { NavLink, NavLinkRenderProps } from 'react-router-dom';

interface TowerNavProps{
    className: string;
}

const linkClass = ({ isActive }: NavLinkRenderProps): string =>
    `flex h-7 shrink-0 items-center rounded-md px-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none ${isActive ? 'bg-selected text-foreground' : 'text-muted hover:bg-selected hover:text-foreground'}`;

const TowerNav = ({ className }: TowerNavProps) => (
    <nav aria-label='Sentinel' className={className}>
        {NAV_ENTRIES.map((entry) => (
            <NavLink
                key={entry.to}
                to={entry.to}
                onPointerEnter={() => void prefetchPage(entry.to)}
                onFocus={() => void prefetchPage(entry.to)}
                className={linkClass}
            >
                {entry.label}
            </NavLink>
        ))}
    </nav>
);

export default TowerNav;
