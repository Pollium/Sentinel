import TowerNav from '@/app/components/TowerNav';
import TowerTabBar from '@/app/components/TowerTabBar';
import TowerJumpTo from '@/app/components/TowerJumpTo';
import AccountMenu from '@/modules/auth/components/AccountMenu';
import { usePageToolbar } from '@sentinel/ui/store/page-toolbar';
import ThemeToggle from '@sentinel/ui/components/layout/ThemeToggle';
import { SessionOutlet } from '@sentinel/ui/contracts/session';
import { Outlet, useOutletContext } from 'react-router-dom';

const TowerLayout = () => {
    const setTitleSlot = usePageToolbar((state) => state.setTitleSlot);
    const setActionsSlot = usePageToolbar((state) => state.setActionsSlot);
    const session = useOutletContext<SessionOutlet>();

    return (
        <div className='flex h-dvh bg-background text-foreground'>
            <div className='chrome-frame flex min-w-0 flex-1'>
                <div className='chrome-surface flex min-w-0 flex-1 flex-col overflow-hidden'>
                    <header className='flex h-[var(--app-header-height)] shrink-0 items-center gap-2 px-4 lg:gap-4 lg:px-6 xl:grid xl:grid-cols-[minmax(max-content,1fr)_minmax(12rem,25rem)_minmax(max-content,1fr)]'>
                        <div ref={setTitleSlot} className='flex min-w-0 flex-1 items-center lg:hidden' />

                        <TowerNav />

                        <TowerJumpTo className='hidden xl:flex' />

                        <div className='ml-auto flex shrink-0 items-center justify-end gap-2'>
                            <div ref={setActionsSlot} className='flex items-center gap-2 empty:hidden' />

                            <div className='flex shrink-0 items-center gap-1'>
                                <ThemeToggle />
                                <AccountMenu operator={session.operator} onRenamed={session.reloadOperator} />
                            </div>
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
