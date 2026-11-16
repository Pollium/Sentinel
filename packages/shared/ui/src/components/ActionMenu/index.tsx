import { DropdownRoot, DropdownTrigger, DropdownPopover, DropdownMenu } from '@heroui/react';
import { EllipsisVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionMenuProps{
    subject: string;
    isDisabled?: boolean;
    children: ReactNode;
}

const TRIGGER = 'relative flex size-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors after:absolute after:-inset-1.5 after:content-[\'\'] hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none';

const ActionMenu = ({ subject, isDisabled, children }: ActionMenuProps) => (
    <DropdownRoot>
        <DropdownTrigger aria-label={`Actions for ${subject}`} isDisabled={isDisabled} className={TRIGGER}>
            <EllipsisVertical className='size-4' aria-hidden='true' />
        </DropdownTrigger>

        <DropdownPopover placement='bottom end'>
            <DropdownMenu>{children}</DropdownMenu>
        </DropdownPopover>
    </DropdownRoot>
);

export default ActionMenu;
