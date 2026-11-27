import { cn, EmptyStateRoot } from '@heroui/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps{
    icon: LucideIcon;
    title: string;
    description?: string;
    compact?: boolean;
}

const EmptyState = ({
    icon: Icon,
    title,
    description,
    compact = false
}: EmptyStateProps) => (
    <EmptyStateRoot
        className={cn(
            'flex flex-col items-center text-center',
            compact ? 'px-4 py-8' : 'flex-1 justify-center px-6 py-16'
        )}
    >
        <span
            className={cn(
                'flex items-center justify-center rounded-full bg-foreground/[0.06]',
                compact ? 'size-10' : 'size-12'
            )}
        >
            <Icon aria-hidden='true' className={compact ? 'size-5' : 'size-6'} />
        </span>

        <h2 className={cn('font-medium text-foreground', compact ? 'mt-4 text-[0.875rem]' : 'mt-5 text-[0.9375rem]')}>
            {title}
        </h2>

        {description && <p className={compact ? 'mt-1.5 text-[0.8125rem]' : 'mt-2 max-w-sm'}>{description}</p>}
    </EmptyStateRoot>
);

export default EmptyState;
