import { useSidebarStore } from '../../../store/sidebar';
import { PanelLeft } from 'lucide-react';

const SidebarToggle = () => {
    const collapsed = useSidebarStore((state) => state.collapsed);
    const toggle = useSidebarStore((state) => state.toggle);

    return (
        <button
            type='button'
            aria-label={collapsed ? 'Show navigation' : 'Hide navigation'}
            aria-expanded={!collapsed}
            onClick={toggle}
            className='hidden shrink-0 items-center text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none lg:inline-flex'
        >
            <PanelLeft className='size-4' aria-hidden='true' />
        </button>
    );
};

export default SidebarToggle;
