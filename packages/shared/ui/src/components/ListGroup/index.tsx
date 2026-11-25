import { count } from '../../utils/format/format-metrics';
import { ReactNode } from 'react';

interface ListGroupProps{
    label: string;
    total: number;
    children: ReactNode;
}

const ListGroup = ({ label, total, children }: ListGroupProps) => (
    <section className='flex flex-col gap-px pt-2.5'>
        <h2 className='flex h-7 items-center justify-between px-3.5 text-[0.75rem] font-medium text-subtle'>
            <span>{label}</span>
            <span className='tabular-nums'>{count(total)}</span>
        </h2>
        {children}
    </section>
);

export default ListGroup;
