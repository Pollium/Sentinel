import { ReactNode } from 'react';

interface RankRowProps{
    label: string;
    meter: ReactNode;
    value: string;
}

const RankRow = ({ label, meter, value }: RankRowProps) => (
    <span className='grid min-h-7 grid-cols-[minmax(0,1fr)_minmax(2.25rem,24%)_minmax(3.25rem,auto)] items-center gap-3'>
        <span className='truncate text-muted'>{label}</span>
        {meter}
        <span className='text-right tabular-nums text-foreground'>{value}</span>
    </span>
);

export default RankRow;
