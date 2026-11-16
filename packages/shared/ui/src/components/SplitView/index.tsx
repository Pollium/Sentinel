import { ReactNode } from 'react';

interface SplitViewProps{
    list: ReactNode;
    detail: ReactNode;
    isDetailFirst: boolean;
}

const SplitView = ({ list, detail, isDetailFirst }: SplitViewProps) => (
    <div className='-mx-4 -my-6 flex min-h-0 flex-1 lg:-mx-6'>
        <aside className={`${isDetailFirst ? 'hidden lg:flex' : 'flex'} w-full shrink-0 flex-col gap-5 overflow-y-auto border-foreground/[0.06] px-3 pb-24 pt-1 lg:w-72 lg:border-r`}>
            {list}
        </aside>
        <section className={`${isDetailFirst ? 'block' : 'hidden lg:block'} min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-4 lg:px-8`}>
            {detail}
        </section>
    </div>
);

export default SplitView;
