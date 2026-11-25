import { ReactNode } from 'react';

interface Fact{
    term: string;
    value: ReactNode;
    note?: string;
    source?: string;
    tone?: 'default' | 'warning';
}

interface FactListProps{
    facts: Fact[];
}

const FactList = ({ facts }: FactListProps) => (
    <dl className='flex flex-col'>
        {facts.map((fact) => (
            <div key={fact.term} title={fact.source} className='flex items-baseline justify-between gap-4 border-b border-line py-2 text-[0.75rem] last:border-b-0'>
                <dt className='shrink-0 text-muted'>{fact.term}</dt>
                <dd className={`min-w-0 truncate text-right tabular-nums ${fact.tone === 'warning' ? 'text-warning' : 'text-foreground'}`}>
                    {fact.value}
                    {fact.note === undefined ? null : <span className='text-muted'> · {fact.note}</span>}
                </dd>
            </div>
        ))}
    </dl>
);

export default FactList;
