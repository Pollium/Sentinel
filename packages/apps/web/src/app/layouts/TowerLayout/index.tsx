import TowerPhoneNav from '@/app/components/TowerPhoneNav';
import TowerSidebar from '@/app/components/TowerSidebar';
import ErrorState from '@sentinel/ui/components/ErrorState';
import Loader from '@sentinel/ui/components/Loader';
import { authRoutes } from '@sentinel/contracts/auth/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { usePageToolbar } from '@sentinel/ui/store/page-toolbar';
import { SessionOutlet } from '@sentinel/ui/contracts/session';
import { Outlet } from 'react-router-dom';

const TowerLayout = () => {
    const setTitleSlot = usePageToolbar((state) => state.setTitleSlot);
    const setActionsSlot = usePageToolbar((state) => state.setActionsSlot);
    const operator = useQuery(authRoutes.me);

    if(operator.error){
        return (
            <div className='flex h-dvh items-center justify-center bg-canvas px-4'>
                <ErrorState
                    title='Something went wrong'
                    description='We could not check your session. Try again.'
                    onRetry={operator.reload}
                />
            </div>
        );
    }

    if(operator.data === null) return <Loader label='Checking your session' className='h-dvh bg-canvas' />;

    const session: SessionOutlet = { operator: operator.data };

    return (
        <div className='flex h-dvh bg-canvas text-foreground'>
            <TowerSidebar operator={session.operator} />

            <div className='flex min-w-0 flex-1 flex-col lg:py-2 lg:pr-2'>
                <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-panel lg:rounded-[10px] lg:border lg:border-line'>
                    <TowerPhoneNav operator={session.operator} />

                    <header className='flex min-h-11 shrink-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b border-line px-4 py-2 lg:flex-nowrap lg:py-0'>
                        <div ref={setTitleSlot} className='flex min-w-0 items-center gap-2.5' />
                        <div ref={setActionsSlot} className='ml-auto flex shrink-0 items-center gap-1.5 empty:hidden' />
                    </header>

                    <main className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
                        <Outlet context={session} />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TowerLayout;
