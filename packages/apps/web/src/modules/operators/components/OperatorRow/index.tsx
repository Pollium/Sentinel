import Avatar from '@sentinel/ui/components/Avatar';
import OperatorActions from '@/modules/operators/components/OperatorActions';
import { Operator } from '@sentinel/contracts/operators/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';

interface OperatorRowProps{
    operator: Operator;
    isSelf: boolean;
    onRemoved: () => void;
}

const OperatorRow = ({ operator, isSelf, onRemoved }: OperatorRowProps) => {
    const seen = operator.lastSignInAt === null ? 'Never signed in' : `Signed in ${formatAgo(operator.lastSignInAt)}`;

    return (
        <li className='flex h-10 items-center gap-3 px-3'>
            <Avatar name={operator.name} />
            <span className='min-w-0 max-w-[60%] truncate text-[0.8125rem] capitalize text-foreground'>{operator.name}</span>
            <span className='min-w-0 flex-1 truncate text-[0.8125rem] text-muted'>{operator.email}</span>
            <span className='hidden shrink-0 text-[0.75rem] tabular-nums text-muted sm:inline'>{isSelf ? 'You' : seen}</span>
            <OperatorActions operator={operator} isSelf={isSelf} onRemoved={onRemoved} />
        </li>
    );
};

export default OperatorRow;
