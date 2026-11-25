import TowerJumpTo from '@/app/components/TowerJumpTo';
import TowerNav from '@/app/components/TowerNav';
import AccountMenu from '@/modules/auth/components/AccountMenu';
import ThemeToggle from '@sentinel/ui/components/layout/ThemeToggle';
import { Operator } from '@sentinel/contracts/operators/domain';

interface TowerSidebarProps{
    operator: Operator;
}

const TowerSidebar = ({ operator }: TowerSidebarProps) => (
    <aside className='hidden w-58 shrink-0 flex-col gap-3.5 overflow-y-auto px-2 py-3 lg:flex'>
        <span className='px-2 pt-0.5 font-semibold tracking-tight text-foreground'>Sentinel</span>
        <TowerJumpTo />
        <TowerNav className='flex flex-col gap-px' />
        <div className='mt-auto flex items-center justify-between gap-2'>
            <AccountMenu operator={operator} placement='top start' />
            <ThemeToggle />
        </div>
    </aside>
);

export default TowerSidebar;
