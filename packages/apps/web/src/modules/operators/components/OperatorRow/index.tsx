import OperatorActions from '@/modules/operators/components/OperatorActions';
import { Operator } from '@sentinel/contracts/operators/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';

interface OperatorRowProps{
    operator: Operator;
    isSelf: boolean;
}

const OperatorRow = ({ operator, isSelf }: OperatorRowProps) => {
    const seen = operator.lastSignInAt === null ? 'Never signed in' : `Signed in ${formatAgo(operator.lastSignInAt)}`;

    return (
        <li className='flex min-h-13 items-center gap-4 border-b border-line px-4 py-2 last:border-b-0'>
            <span className='min-w-0 flex-1'>
                <span className='block truncate font-medium capitalize text-foreground'>{operator.name}</span>
                <span className='block truncate text-[0.75rem] text-subtle'>{operator.email}</span>
            </span>
            <span className={`hidden shrink-0 tabular-nums sm:inline ${isSelf ? 'text-foreground' : 'text-subtle'}`}>{isSelf ? 'You' : seen}</span>
            <OperatorActions operator={operator} isSelf={isSelf} />
        </li>
    );
};

export default OperatorRow;
