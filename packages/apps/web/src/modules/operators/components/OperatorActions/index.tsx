import ActionMenu from '@sentinel/ui/components/ActionMenu';
import ConfirmDialog from '@sentinel/ui/components/ConfirmDialog';
import { Operator } from '@sentinel/contracts/operators/domain';
import { useMutation } from '@sentinel/ui/hooks/api/use-mutation';
import { operatorsApi } from '@/modules/operators/api/api';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { DropdownItem } from '@heroui/react';
import { useState } from 'react';

interface OperatorActionsProps{
    operator: Operator;
    isSelf: boolean;
    onRemoved: () => void;
}

const OperatorActions = ({ operator, isSelf, onRemoved }: OperatorActionsProps) => {
    const [confirming, setConfirming] = useState(false);
    const remove = useMutation(operatorsApi.remove, {
        onSuccess: () => {
            setConfirming(false);
            onRemoved();
        }
    });

    return (
        <>
            <ActionMenu subject={operator.name} isDisabled={isSelf}>
                <DropdownItem variant='danger' onAction={() => setConfirming(true)}>
                    Remove operator
                </DropdownItem>
            </ActionMenu>

            <ConfirmDialog
                isOpen={confirming}
                onOpenChange={setConfirming}
                title='Remove operator'
                description={`${operator.name} is signed out everywhere and can no longer open this console.`}
                confirmLabel='Remove'
                isPending={remove.loading}
                error={errorCopy(remove.error)}
                onConfirm={() => { void remove.run(operator.id).catch(() => undefined); }}
            />
        </>
    );
};

export default OperatorActions;
