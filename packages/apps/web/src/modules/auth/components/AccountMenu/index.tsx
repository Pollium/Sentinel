import Avatar from '@sentinel/ui/components/Avatar';
import Modal from '@sentinel/ui/components/Modal';
import NameForm from '@/modules/auth/components/NameForm';
import PasswordForm from '@/modules/auth/components/PasswordForm';
import { endSession } from '@sentinel/ui/services/end-session';
import { session } from '@pollium/readable-react/session/session';
import { Operator } from '@sentinel/contracts/operators/domain';
import { DropdownItem, DropdownMenu, DropdownPopover, DropdownRoot, DropdownSection, DropdownTrigger, Header, Separator } from '@heroui/react';
import { useState } from 'react';

type AccountSheet = 'name' | 'password';

interface AccountMenuProps{
    operator: Operator;
    onRenamed: () => void;
}

const AccountMenu = ({ operator, onRenamed }: AccountMenuProps) => {
    const [sheet, setSheet] = useState<AccountSheet | null>(null);

    const open = (next: AccountSheet) => (isOpen: boolean) => setSheet(isOpen ? next : null);

    return (
        <>
            <DropdownRoot>
                <DropdownTrigger
                    aria-label='Account'
                    className='group flex items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
                >
                    <span className='max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:max-w-44 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:hidden'>
                        <span className='block whitespace-nowrap pr-2.5 text-[0.875rem] font-medium capitalize text-foreground'>
                            {operator.name}
                        </span>
                    </span>

                    <Avatar name={operator.name} />
                </DropdownTrigger>

                <DropdownPopover placement='bottom end'>
                    <DropdownMenu aria-label='Account'>
                        <DropdownSection>
                            <Header>{operator.email}</Header>
                            <DropdownItem onAction={() => setSheet('name')}>Change name</DropdownItem>
                            <DropdownItem onAction={() => setSheet('password')}>Change password</DropdownItem>
                        </DropdownSection>

                        <Separator />

                        <DropdownItem onAction={() => void endSession(session.token)}>Sign out</DropdownItem>
                    </DropdownMenu>
                </DropdownPopover>
            </DropdownRoot>

            <Modal isOpen={sheet === 'name'} onOpenChange={open('name')} title='Change name'>
                <NameForm
                    name={operator.name}
                    onSaved={() => {
                        setSheet(null);
                        onRenamed();
                    }}
                />
            </Modal>

            <Modal isOpen={sheet === 'password'} onOpenChange={open('password')} title='Change password'>
                <PasswordForm onChanged={() => setSheet(null)} />
            </Modal>
        </>
    );
};

export default AccountMenu;
