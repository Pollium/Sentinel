import NavItem from '@sentinel/ui/components/layout/NavItem';
import { FOOTER_ENTRIES, NAV_ENTRIES } from '@/app/navigation/items';
import { useNavAttention } from '@/modules/tower/hooks/use-nav-attention';

interface TowerNavProps{
    onNavigate?: () => void;
}

const TowerNav = ({ onNavigate }: TowerNavProps) => {
    const attention = useNavAttention();

    return (
        <nav aria-label='Sentinel' className='flex min-h-0 flex-col gap-0.5 overflow-y-auto overflow-x-hidden'>
            {NAV_ENTRIES.map((entry) => (
                <NavItem key={entry.to} icon={entry.icon} label={entry.label} to={entry.to} onClick={onNavigate} attention={attention[entry.to]} />
            ))}

            <div className='mt-auto flex flex-col gap-0.5'>
                {FOOTER_ENTRIES.map((entry) => (
                    <NavItem key={entry.to} icon={entry.icon} label={entry.label} to={entry.to} onClick={onNavigate} attention={attention[entry.to]} />
                ))}
            </div>
        </nav>
    );
};

export default TowerNav;
