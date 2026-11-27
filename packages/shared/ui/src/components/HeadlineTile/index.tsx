import { HeadlineMetric } from '../../contracts/chart';

interface HeadlineTileProps{
    metric: HeadlineMetric;
    isSelected: boolean;
    onSelect: () => void;
}

const HeadlineTile = ({ metric, isSelected, onSelect }: HeadlineTileProps) => (
    <button
        type='button'
        role='tab'
        aria-selected={isSelected}
        onClick={onSelect}
        className={`flex min-w-0 flex-col items-start gap-1 border-b-2 pb-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground/30 motion-reduce:transition-none ${isSelected ? 'border-foreground' : 'border-transparent hover:border-foreground/15'}`}
    >
        <span className={`truncate text-[0.8125rem] ${isSelected ? 'text-foreground' : 'text-muted'}`}>{metric.label}</span>
        <span className='truncate text-2xl font-semibold tabular-nums tracking-tight text-foreground'>{metric.value}</span>
        <span className='min-h-[1lh] text-[0.75rem] tabular-nums text-muted'>{metric.delta}</span>
    </button>
);

export default HeadlineTile;
