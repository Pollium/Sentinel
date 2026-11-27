import StatusDot, { StatusTone } from '../StatusDot';
import PanelScroll from '../PanelScroll';
import { Link } from 'react-router-dom';

interface CompactRow{
    key: string;
    label: string;
    value: string;
    note?: string;
    tone?: StatusTone;
    to?: string;
}

interface CompactListProps{
    rows: CompactRow[];
    empty: string;
}

const ROW = '-mx-1.5 flex items-baseline justify-between gap-4 rounded-md px-1.5 py-2 text-[0.75rem]';

const CompactList = ({ rows, empty }: CompactListProps) => {
    if(rows.length === 0) return <p className='text-[0.75rem] text-muted'>{empty}</p>;

    return (
        <PanelScroll>
            <ul className='flex flex-col'>
                {rows.map((row) => {
                    const content = (
                        <>
                            <span className='flex min-w-0 items-center gap-3'>
                                {row.tone === undefined ? null : <StatusDot tone={row.tone} />}
                                <span className='min-w-0'>
                                    <span className='block truncate text-foreground'>{row.label}</span>
                                    {row.note === undefined ? null : <span className='block truncate text-muted'>{row.note}</span>}
                                </span>
                            </span>
                            <span className='shrink-0 tabular-nums text-muted'>{row.value}</span>
                        </>
                    );

                    return (
                        <li key={row.key} className='border-b border-foreground/[0.05] last:border-b-0'>
                            {row.to === undefined
                                ? <div className={ROW}>{content}</div>
                                : <Link to={row.to} className={`${ROW} hover:bg-foreground/[0.04]`}>{content}</Link>}
                        </li>
                    );
                })}
            </ul>
        </PanelScroll>
    );
};

export default CompactList;
