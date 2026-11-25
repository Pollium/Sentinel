import Modal from '@sentinel/ui/components/Modal';
import NameForm from '@/modules/auth/components/NameForm';
import PasswordForm from '@/modules/auth/components/PasswordForm';
import { session } from '@pollium/readable-react/session/session';
import { Operator } from '@sentinel/contracts/operators/domain';
import { DropdownItem, DropdownMenu, DropdownPopover, DropdownRoot, DropdownSection, DropdownTrigger, Header, Separator } from '@heroui/react';
import { useState } from 'react';

type AccountSheet = 'name' | 'password';

interface AccountMenuProps{
    operator: Operator;
    placement: 'top start' | 'bottom end';
}

const AccountMenu = ({ operator, placement }: AccountMenuProps) => {
    const [sheet, setSheet] = useState<AccountSheet | null>(null);

    const open = (next: AccountSheet) => (isOpen: boolean) => setSheet(isOpen ? next : null);

    return (
        <>
            <DropdownRoot>
                <DropdownTrigger
                    aria-label='Account'
                    className='flex h-7 min-w-0 max-w-40 items-center rounded-md px-2 font-medium capitalize text-muted transition-colors hover:bg-selected hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none'
                >
                    <span className='truncate'>{operator.name}</span>
                </DropdownTrigger>

                <DropdownPopover placement={placement}>
                    <DropdownMenu aria-label='Account'>
                        <DropdownSection>
                            <Header>{operator.email}</Header>
                            <DropdownItem onAction={() => setSheet('name')}>Change name</DropdownItem>
                            <DropdownItem onAction={() => setSheet('password')}>Change password</DropdownItem>
                        </DropdownSection>

                        <Separator />

                        <DropdownItem onAction={() => session.end()}>Sign out</DropdownItem>
                    </DropdownMenu>
                </DropdownPopover>
            </DropdownRoot>

            <Modal isOpen={sheet === 'name'} onOpenChange={open('name')} title='Change name'>
                <NameForm name={operator.name} onSaved={() => setSheet(null)} />
            </Modal>

            <Modal isOpen={sheet === 'password'} onOpenChange={open('password')} title='Change password'>
                <PasswordForm onChanged={() => setSheet(null)} />
            </Modal>
        </>
    );
};

export default AccountMenu;
