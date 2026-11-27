interface ChartTipProps{
    label: string;
    value: string;
    note?: string;
    x: number;
    y: number;
}

const ChartTip = ({ label, value, note, x, y }: ChartTipProps) => (
    <div
        className='pointer-events-none absolute z-20 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-foreground/10 bg-foreground px-3 py-2 text-background shadow-lg'
        style={{ left: x, top: y }}
    >
        <p className='text-[0.6875rem] text-background/60'>{label}</p>
        <p className='text-[0.9375rem] font-semibold tabular-nums tracking-tight'>{value}</p>
        {note === undefined ? null : <p className='text-[0.6875rem] text-background/65'>{note}</p>}
    </div>
);

export default ChartTip;
