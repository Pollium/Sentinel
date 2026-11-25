import { Button } from '@heroui/react';

interface ErrorStateProps{
    title: string;
    description: string | null | undefined;
    onRetry: () => void;
}

const ErrorState = ({ title, description, onRetry }: ErrorStateProps) => (
    <section className='flex flex-col items-start gap-4 m-5 rounded-lg border border-line bg-raised p-5'>
        <div className='flex flex-col gap-1'>
            <h2 className='font-medium text-foreground'>{title}</h2>
            {description != null && <p className='text-muted'>{description}</p>}
        </div>

        <Button size='sm' variant='outline' onPress={onRetry}>Try again</Button>
    </section>
);

export default ErrorState;
