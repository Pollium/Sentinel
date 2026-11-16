import { Button } from '@heroui/react';

interface RefreshFailedProps{
    onRetry: () => void;
}

const RefreshFailed = ({ onRetry }: RefreshFailedProps) => (
    <div role='alert' className='flex flex-wrap items-center gap-2 text-[0.8125rem] text-[var(--danger)]'>
        <span>This couldn't be refreshed, so it may be out of date.</span>
        <Button size='sm' variant='ghost' onPress={onRetry}>Try again</Button>
    </div>
);

export default RefreshFailed;
