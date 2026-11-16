interface SkeletonProps{
    className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => (
    <span
        aria-hidden='true'
        className={`block animate-pulse bg-foreground/10 motion-reduce:animate-none ${className}`}
    />
);

export default Skeleton;
