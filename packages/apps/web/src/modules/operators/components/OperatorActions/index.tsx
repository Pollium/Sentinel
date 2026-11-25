import ActionMenu from '@sentinel/ui/components/ActionMenu';
import ConfirmDialog from '@sentinel/ui/components/ConfirmDialog';
import { Operator } from '@sentinel/contracts/operators/domain';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { useMutation } from '@pollium/readable-react/query/useMutation';
import { errorCopy } from '@/modules/operators/utils/error-copy';
import { DropdownItem } from '@heroui/react';
import { useState } from 'react';

interface OperatorActionsProps{
    operator: Operator;
    isSelf: boolean;
}

const OperatorActions = ({ operator, isSelf }: OperatorActionsProps) => {
    const [confirming, setConfirming] = useState(false);
    const remove = useMutation(operatorRoutes.remove, {
        path: { operatorId: operator.id },
        onSuccess: () => setConfirming(false)
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
                onConfirm={() => { void remove.run().catch(() => undefined); }}
            />
        </>
    );
};

export default OperatorActions;
