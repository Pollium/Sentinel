export type StatusTone = 'danger' | 'warning' | 'neutral';

const FILL: Record<StatusTone, string> = {
    danger: 'bg-danger',
    warning: 'bg-warning',
    neutral: 'bg-foreground/25'
};

interface StatusDotProps{
    tone: StatusTone;
    label?: string;
}

const StatusDot = ({ tone, label }: StatusDotProps) => (
    <span
        role={label === undefined ? undefined : 'img'}
        aria-label={label}
        aria-hidden={label === undefined ? 'true' : undefined}
        title={label}
        className={`size-1.5 shrink-0 rounded-full ${FILL[tone]}`}
    />
);

export default StatusDot;
