import { prefetchRoute } from '../../../utils/routing/route-prefetch';
import { Tab } from '../TabBar';
import { NavLink } from 'react-router-dom';

const tabClass = (on: boolean) =>
    `group flex h-full min-w-0 flex-1 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none ${on ? 'text-foreground' : 'text-muted/70'}`;

const TabSlot = ({ icon: Icon, label, to }: Tab) => (
    <NavLink
        to={to}
        aria-label={label}
        onPointerEnter={() => void prefetchRoute(to)}
        onFocus={() => void prefetchRoute(to)}
        className={({ isActive }) => tabClass(isActive)}
    >
        {({ isActive }) => (
            <span className={`relative isolate flex size-10 items-center justify-center rounded-full ${isActive ? 'bg-foreground/[0.07]' : ''}`}>
                <Icon className='size-[22px] transition-transform duration-150 group-active:scale-90 motion-reduce:transition-none' aria-hidden='true' />
            </span>
        )}
    </NavLink>
);

export default TabSlot;
