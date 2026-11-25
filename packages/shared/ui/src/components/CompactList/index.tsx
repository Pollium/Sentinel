import PanelScroll from '../PanelScroll';
import { StatusTone } from '../../contracts/status';
import { TONE_TEXT } from '../../utils/format/tone-text';
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

const ROW = '-mx-1.5 flex items-baseline justify-between gap-4 rounded-md px-1.5 py-1.5';

const CompactList = ({ rows, empty }: CompactListProps) => {
    if(rows.length === 0) return <p className='text-[0.75rem] text-subtle'>{empty}</p>;

    return (
        <PanelScroll>
            <ul className='flex flex-col'>
                {rows.map((row) => {
                    const content = (
                        <>
                            <span className='min-w-0'>
                                <span className='block truncate text-foreground'>{row.label}</span>
                                {row.note === undefined ? null : <span className='block truncate text-subtle'>{row.note}</span>}
                            </span>
                            <span className={`shrink-0 tabular-nums ${row.tone === undefined ? 'text-subtle' : TONE_TEXT[row.tone]}`}>{row.value}</span>
                        </>
                    );

                    return (
                        <li key={row.key} className='border-b border-line last:border-b-0'>
                            {row.to === undefined
                                ? <div className={ROW}>{content}</div>
                                : <Link to={row.to} className={`${ROW} hover:bg-selected`}>{content}</Link>}
                        </li>
                    );
                })}
            </ul>
        </PanelScroll>
    );
};

export default CompactList;
