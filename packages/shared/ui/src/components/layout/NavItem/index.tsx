import AttentionDot from '../AttentionDot';
import { navItemClass } from '../../../utils/routing/nav-item-class';
import { prefetchRoute } from '../../../utils/routing/route-prefetch';
import { ReactNode, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps{
    icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
    label: string;
    to: string;
    onClick?: () => void;
    attention?: string;
}

const NavItem = ({ icon: Icon, label, to, onClick, attention }: NavItemProps) => (
    <NavLink
        to={to}
        onClick={onClick}
        onPointerEnter={() => void prefetchRoute(to)}
        onFocus={() => void prefetchRoute(to)}
        className={({ isActive }) => navItemClass(isActive)}
    >
        {({ isActive }) => (
            <>
                {isActive ? <span aria-hidden='true' className='nav-indicator' /> : null}
                <span className='flex size-6 shrink-0 items-center justify-center'>
                    <Icon className='size-[18px]' />
                </span>
                <span className='truncate'>{label}</span>
                {attention === undefined ? null : <AttentionDot label={attention} />}
            </>
        )}
    </NavLink>
);

export default NavItem;
