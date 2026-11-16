import { cn, Spinner } from '@heroui/react';

interface LoaderProps{
    label: string;
    className?: string;
}

const Loader = ({ label, className }: LoaderProps) => (
    <div className={cn('flex items-center justify-center', className)} role='status' aria-label={label}>
        <Spinner />
    </div>
);

export default Loader;
