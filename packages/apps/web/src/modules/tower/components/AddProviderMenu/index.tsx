import Modal from '@sentinel/ui/components/Modal';
import ProviderForm from '@/modules/tower/components/ProviderForm';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { KIND_LABEL, KINDS } from '@/modules/tower/utils/kinds';
import { Button, DropdownItem, DropdownMenu, DropdownPopover, DropdownRoot } from '@heroui/react';
import { useState } from 'react';

const isKind = (key: unknown): key is GatewayKind => KINDS.some((kind) => kind === key);

const AddProviderMenu = () => {
    const [adding, setAdding] = useState<GatewayKind | null>(null);

    return (
        <>
            <DropdownRoot>
                <Button size='sm' variant='outline' aria-label='Add a provider' className='shrink-0 gap-1'>
                    Add provider
                    <span aria-hidden='true' className='text-[0.625rem]'>▾</span>
                </Button>

                <DropdownPopover placement='bottom end'>
                    <DropdownMenu aria-label='Kind of provider' onAction={(key) => { if(isKind(key)) setAdding(key); }}>
                        {KINDS.map((kind) => <DropdownItem key={kind} id={kind}>{KIND_LABEL[kind]}</DropdownItem>)}
                    </DropdownMenu>
                </DropdownPopover>
            </DropdownRoot>

            <Modal
                isOpen={adding !== null}
                onOpenChange={(isOpen) => { if(!isOpen) setAdding(null); }}
                title={adding === null ? '' : `Add a ${KIND_LABEL[adding]} provider`}
                width={adding === 'chat' ? 'wide' : 'default'}
            >
                {adding === null ? null : (
                    <ProviderForm kind={adding} provider={null} onSaved={() => setAdding(null)} />
                )}
            </Modal>
        </>
    );
};

export default AddProviderMenu;
