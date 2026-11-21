import { DropdownRoot, DropdownPopover, DropdownMenu } from '@heroui/react';
import { ComponentProps, ReactNode } from 'react';
import { Pressable } from 'react-aria-components/Pressable';

interface ContextMenuProps{
    menu: ReactNode;
    children: ComponentProps<typeof Pressable>['children'];
}

const ContextMenu = ({ menu, children }: ContextMenuProps) => (
    <DropdownRoot trigger='contextMenu'>
        <Pressable>{children}</Pressable>

        <DropdownPopover>
            <DropdownMenu>{menu}</DropdownMenu>
        </DropdownPopover>
    </DropdownRoot>
);

export default ContextMenu;
