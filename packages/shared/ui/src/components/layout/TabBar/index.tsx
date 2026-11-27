import TabSlot from '../TabSlot';
import { ReactNode, SVGProps } from 'react';

export interface Tab{
    icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
    label: string;
    to: string;
}

interface TabBarProps{
    tabs: Tab[];
}

const TabBar = ({ tabs }: TabBarProps) => (
    <nav aria-label='Primary' className='chrome-tabbar shrink-0 lg:hidden'>
        <ul className='flex h-14 items-stretch border-t border-foreground/[0.06]'>
            {tabs.map((tab) => (
                <li key={tab.label} className='flex min-w-0 flex-1'>
                    <TabSlot {...tab} />
                </li>
            ))}
        </ul>
    </nav>
);

export default TabBar;
