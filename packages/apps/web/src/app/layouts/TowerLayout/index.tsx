import TowerNav from '@/app/components/TowerNav';
import TowerTabBar from '@/app/components/TowerTabBar';
import TowerJumpTo from '@/app/components/TowerJumpTo';
import { usePageToolbar } from '@sentinel/ui/store/page-toolbar';
import NavDrawer from '@sentinel/ui/components/NavDrawer';
import NavToggle from '@sentinel/ui/components/layout/NavToggle';
import SidebarToggle from '@sentinel/ui/components/layout/SidebarToggle';
import ThemeToggle from '@sentinel/ui/components/layout/ThemeToggle';
import { useSidebarStore } from '@sentinel/ui/store/sidebar';
import { SessionOutlet } from '@sentinel/ui/contracts/session';
import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

const TowerLayout = () => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const collapsed = useSidebarStore((state) => state.collapsed);
    const setSlot = usePageToolbar((state) => state.setSlot);
    const session = useOutletContext<SessionOutlet>();

    return (
        <div className='flex h-dvh bg-background text-foreground'>
            <aside
                inert={collapsed}
                data-state={collapsed ? 'idle' : 'active'}
                className='app-sidebar hidden shrink-0 flex-col overflow-hidden lg:flex'
            >
                <div className='grid min-h-0 w-56 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] border-r border-foreground/[0.06] px-3 pb-3 pt-5'>
                    <TowerNav />
                </div>
            </aside>

            {isDrawerOpen ? (
                <NavDrawer title='Sentinel' onClose={() => setDrawerOpen(false)}>
                    <TowerNav onNavigate={() => setDrawerOpen(false)} />
                </NavDrawer>
            ) : null}

            <div className='chrome-frame flex min-w-0 flex-1'>
                <div className='chrome-surface flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--dashboard-surface)]'>
                    <header className='flex h-[var(--app-header-height)] shrink-0 items-center gap-2 px-4 lg:px-6'>
                        <div className='flex shrink-0 items-center gap-0.5'>
                            <NavToggle onOpen={() => setDrawerOpen(true)} />
                            <SidebarToggle />
                        </div>

                        <div ref={setSlot} className='flex min-w-0 flex-1 items-center gap-3' />

                        <TowerJumpTo className='hidden w-64 lg:flex' />

                        <div className='flex shrink-0 items-center justify-end gap-1'>
                            <ThemeToggle />
                        </div>
                    </header>

                    <main className='animate-enter flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-6'>
                        <Outlet context={session} />
                    </main>

                    <TowerTabBar />
                </div>
            </div>
        </div>
    );
};

export default TowerLayout;
