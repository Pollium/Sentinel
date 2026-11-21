import { Tab } from '../TabBar';
import { prefetchRoute } from '../../../utils/routing/route-prefetch';
import { NavLink } from 'react-router-dom';

interface NavTabsProps{
    label: string;
    tabs: Tab[];
}

const tabClass = (active: boolean): string =>
    `flex h-8 items-center whitespace-nowrap rounded-lg px-2.5 text-[0.875rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none ${
        active ? 'text-foreground' : 'text-muted hover:text-foreground'
    }`;

const NavTabs = ({ label, tabs }: NavTabsProps) => (
    <nav aria-label={label} className='-ml-2.5 hidden w-max shrink-0 items-center lg:flex'>
        {tabs.map((tab) => (
            <NavLink
                key={tab.to}
                to={tab.to}
                onPointerEnter={() => void prefetchRoute(tab.to)}
                onFocus={() => void prefetchRoute(tab.to)}
                className={({ isActive }) => tabClass(isActive)}
            >
                {tab.label}
            </NavLink>
        ))}
    </nav>
);

export default NavTabs;
