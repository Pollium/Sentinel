import { cn, EmptyStateRoot } from '@heroui/react';

interface EmptyStateProps{
    title: string;
    description?: string;
    compact?: boolean;
}

const EmptyState = ({ title, description, compact = false }: EmptyStateProps) => (
    <EmptyStateRoot className={cn('flex flex-col items-center text-center', compact ? 'px-4 py-8' : 'flex-1 justify-center px-6 py-16')}>
        <h2 className='font-medium text-foreground'>{title}</h2>
        {description && <p className='mt-1 max-w-sm text-muted'>{description}</p>}
    </EmptyStateRoot>
);

export default EmptyState;
