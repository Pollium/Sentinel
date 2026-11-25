const PERCENT = 100;

interface MeterProps{
    fill: number;
    failed: number;
}

const Meter = ({ fill, failed }: MeterProps) => (
    <span aria-hidden='true' className='flex h-1 min-w-0 gap-px overflow-hidden rounded-full bg-bar'>
        <span className='h-full shrink-0 rounded-full bg-bar-strong' style={{ width: `${Math.max(0, fill - failed) * PERCENT}%` }} />
        {failed === 0 ? null : <span className='h-full min-w-0.5 shrink-0 rounded-full bg-danger' style={{ width: `${failed * PERCENT}%` }} />}
    </span>
);

export default Meter;
