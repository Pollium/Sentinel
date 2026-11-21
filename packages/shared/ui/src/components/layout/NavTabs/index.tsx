import { Tab } from '../TabBar';
import { prefetchRoute } from '../../../utils/routing/route-prefetch';
import { useLayoutEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavTabsProps{
    label: string;
    tabs: Tab[];
}

const tabClass = (active: boolean): string =>
    `relative z-10 flex h-8 items-center whitespace-nowrap rounded-[0.5625rem] px-3 text-[0.875rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none ${
        active ? 'text-foreground' : 'text-muted hover:text-foreground'
    }`;

const place = (marker: HTMLElement, target: HTMLElement) => {
    marker.style.width = `${target.offsetWidth}px`;
    marker.style.transform = `translateX(${target.offsetLeft}px)`;
};

const NavTabs = ({ label, tabs }: NavTabsProps) => {
    const nav = useRef<HTMLElement>(null);
    const pill = useRef<HTMLSpanElement>(null);
    const ghost = useRef<HTMLSpanElement>(null);
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        const root = nav.current;
        const marker = pill.current;
        if(root === null || marker === null) return;

        const settle = () => {
            const active = root.querySelector<HTMLElement>('[aria-current="page"]');
            marker.hidden = active === null;
            if(active !== null) place(marker, active);
        };

        settle();
        const observer = new ResizeObserver(settle);
        observer.observe(root);
        const frame = requestAnimationFrame(() => root.setAttribute('data-ready', ''));

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [pathname]);

    const hover = (target: HTMLElement) => {
        const marker = ghost.current;
        if(marker === null) return;

        place(marker, target);
        if(marker.hasAttribute('data-on')) return;

        marker.getBoundingClientRect();
        marker.setAttribute('data-on', '');
    };

    return (
        <nav
            ref={nav}
            aria-label={label}
            onPointerLeave={() => ghost.current?.removeAttribute('data-on')}
            className='nav-tabs relative hidden w-max shrink-0 items-center rounded-xl p-[3px] lg:flex'
        >
            <span ref={ghost} aria-hidden='true' className='nav-tabs__ghost' />
            <span ref={pill} aria-hidden='true' className='nav-tabs__pill' />

            {tabs.map((tab) => (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    onPointerEnter={(event) => {
                        hover(event.currentTarget);
                        void prefetchRoute(tab.to);
                    }}
                    onFocus={() => void prefetchRoute(tab.to)}
                    className={({ isActive }) => tabClass(isActive)}
                >
                    {tab.label}
                </NavLink>
            ))}
        </nav>
    );
};

export default NavTabs;
