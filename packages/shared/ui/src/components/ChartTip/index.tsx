interface ChartTipProps{
    label: string;
    value: string;
    note?: string;
    x: number;
    y: number;
}

const ChartTip = ({ label, value, note, x, y }: ChartTipProps) => (
    <div
        className='pointer-events-none absolute z-20 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-[7px] border border-line-strong bg-raised px-2.5 py-2 text-[0.75rem] shadow-[var(--overlay-shadow)]'
        style={{ left: x, top: y }}
    >
        <p className='text-subtle'>{label}</p>
        <p className='font-semibold tabular-nums text-foreground'>{value}</p>
        {note === undefined ? null : <p className='text-subtle'>{note}</p>}
    </div>
);

export default ChartTip;
