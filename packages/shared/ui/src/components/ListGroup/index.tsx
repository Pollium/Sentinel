import StatusDot, { StatusTone } from '../StatusDot';
import { count } from '../../utils/format/format-metrics';
import { ReactNode } from 'react';

interface ListGroupProps{
    label: string;
    total: number;
    tone: StatusTone | null;
    children: ReactNode;
}

const ListGroup = ({ label, total, tone, children }: ListGroupProps) => (
    <section className='flex flex-col gap-0.5'>
        <h2 className='flex items-center gap-2 px-3 pb-1 text-[0.75rem] font-normal text-muted'>
            {tone === null ? null : <StatusDot tone={tone} />}
            {label}
            <span className='tabular-nums'>{count(total)}</span>
        </h2>
        {children}
    </section>
);

export default ListGroup;
