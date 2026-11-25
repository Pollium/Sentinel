import { HeadlineMetric } from '../../contracts/chart';

interface HeadlineTileProps{
    metric: HeadlineMetric;
    isSelected: boolean;
    isCompact: boolean;
    onSelect: () => void;
}

const HeadlineTile = ({ metric, isSelected, isCompact, onSelect }: HeadlineTileProps) => (
    <button
        type='button'
        role='tab'
        aria-selected={isSelected}
        onClick={onSelect}
        className={`relative flex min-w-0 flex-col items-start px-5 text-left shadow-[1px_0_0_var(--line),0_1px_0_var(--line)] outline-none transition-colors after:absolute after:inset-x-5 after:bottom-0 after:h-0.5 hover:bg-raised focus-visible:bg-raised motion-reduce:transition-none ${isCompact ? 'pb-3 pt-2.5' : 'pb-4 pt-4.5'} ${isSelected ? 'after:bg-foreground' : ''}`}
    >
        <span className={`max-w-full truncate text-muted ${isCompact ? 'text-[0.75rem]' : ''}`}>{metric.label}</span>
        <span className={`max-w-full truncate font-semibold tabular-nums tracking-tight text-foreground ${isCompact ? 'text-[0.9375rem]' : 'my-0.5 text-[1.375rem]'}`}>{metric.value}</span>
        <span className='min-h-[1lh] max-w-full truncate text-[0.75rem] tabular-nums text-subtle'>{metric.delta}</span>
    </button>
);

export default HeadlineTile;
