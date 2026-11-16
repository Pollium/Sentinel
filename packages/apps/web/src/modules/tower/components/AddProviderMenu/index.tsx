import Modal from '@sentinel/ui/components/Modal';
import ProviderForm from '@/modules/tower/components/ProviderForm';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { KIND_LABEL, KINDS } from '@/modules/tower/utils/kinds';
import { Button, DropdownItem, DropdownMenu, DropdownPopover, DropdownRoot } from '@heroui/react';
import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

interface AddProviderMenuProps{
    onAdded: () => void;
}

const isKind = (key: unknown): key is GatewayKind => KINDS.some((kind) => kind === key);

const AddProviderMenu = ({ onAdded }: AddProviderMenuProps) => {
    const [adding, setAdding] = useState<GatewayKind | null>(null);

    return (
        <>
            <DropdownRoot>
                <Button size='sm' variant='ghost' aria-label='Add a provider' className='shrink-0 gap-1.5 text-muted hover:text-foreground max-sm:px-2'>
                    <Plus className='size-4' aria-hidden='true' />
                    <span className='hidden sm:inline'>Add provider</span>
                    <ChevronDown className='hidden size-3 opacity-60 sm:block' aria-hidden='true' />
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
                    <ProviderForm
                        kind={adding}
                        provider={null}
                        onSaved={() => {
                            setAdding(null);
                            onAdded();
                        }}
                    />
                )}
            </Modal>
        </>
    );
};

export default AddProviderMenu;
