import { ReactNode } from 'react';

interface SplitViewProps{
    list: ReactNode;
    detail: ReactNode;
    isDetailFirst: boolean;
}

const SplitView = ({ list, detail, isDetailFirst }: SplitViewProps) => (
    <div className='flex min-h-0 flex-1'>
        <aside className={`${isDetailFirst ? 'hidden lg:flex' : 'flex'} w-full shrink-0 flex-col overflow-y-auto pb-6 pt-1.5 lg:w-72 lg:border-r lg:border-line`}>
            {list}
        </aside>
        <section className={`${isDetailFirst ? 'block' : 'hidden lg:block'} min-w-0 flex-1 overflow-y-auto pb-16`}>
            {detail}
        </section>
    </div>
);

export default SplitView;
