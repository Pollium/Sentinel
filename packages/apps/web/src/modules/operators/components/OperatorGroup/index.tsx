import { count } from '@sentinel/ui/utils/format/format-metrics';
import { ReactNode } from 'react';

interface OperatorGroupProps{
    label: string;
    total: number;
    children: ReactNode;
}

const OperatorGroup = ({ label, total, children }: OperatorGroupProps) => (
    <section className='flex flex-col gap-2.5'>
        <h2 className='font-semibold text-foreground'>
            {label} <span className='font-normal tabular-nums text-subtle'>{count(total)}</span>
        </h2>
        <ul className='flex flex-col overflow-hidden rounded-lg border border-line'>{children}</ul>
    </section>
);

export default OperatorGroup;
