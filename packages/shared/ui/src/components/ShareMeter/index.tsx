import Meter from '../Meter';

interface ShareMeterProps{
    fraction: number;
    label: string;
}

const ShareMeter = ({ fraction, label }: ShareMeterProps) => (
    <span title={label} className='flex items-center gap-2'>
        {fraction === 0 ? null : <span className='w-11'><Meter fill={fraction} failed={0} /></span>}
        {label}
    </span>
);

export default ShareMeter;
