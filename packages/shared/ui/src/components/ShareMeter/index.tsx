const PERCENT = 100;

interface ShareMeterProps{
    fraction: number;
    label: string;
    isLabelShown: boolean;
}

const ShareMeter = ({ fraction, label, isLabelShown }: ShareMeterProps) => {
    if(fraction === 0) return null;

    return (
        <span title={label} className='flex shrink-0 items-center gap-2'>
            {isLabelShown ? <span className='text-[0.75rem] tabular-nums text-muted'>{label}</span> : null}
            <span
                role={isLabelShown ? undefined : 'img'}
                aria-label={isLabelShown ? undefined : label}
                aria-hidden={isLabelShown ? 'true' : undefined}
                className='flex h-1 w-8 rounded-full bg-foreground/[0.09]'
            >
                <span className='h-full min-w-0.5 rounded-full bg-foreground/55' style={{ width: `${fraction * PERCENT}%` }} />
            </span>
        </span>
    );
};

export default ShareMeter;
