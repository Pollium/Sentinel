import TowerNav from '@/app/components/TowerNav';
import AccountMenu from '@/modules/auth/components/AccountMenu';
import ThemeToggle from '@sentinel/ui/components/layout/ThemeToggle';
import { Operator } from '@sentinel/contracts/operators/domain';

interface TowerPhoneNavProps{
    operator: Operator;
}

const TowerPhoneNav = ({ operator }: TowerPhoneNavProps) => (
    <div className='flex shrink-0 flex-wrap items-center gap-1 border-b border-line px-2 py-1.5 lg:hidden'>
        <TowerNav className='flex flex-wrap gap-0.5' />
        <div className='ml-auto flex shrink-0 items-center'>
            <ThemeToggle />
            <AccountMenu operator={operator} placement='bottom end' />
        </div>
    </div>
);

export default TowerPhoneNav;
