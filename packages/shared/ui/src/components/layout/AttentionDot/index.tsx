interface AttentionDotProps{
    label: string;
}

const AttentionDot = ({ label }: AttentionDotProps) => (
    <span role='img' aria-label={label} title={label} className='ml-auto size-1.5 shrink-0 rounded-full bg-warning' />
);

export default AttentionDot;
