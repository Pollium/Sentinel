import InvitationActions from '@/modules/operators/components/InvitationActions';
import { Invitation } from '@sentinel/contracts/invitations/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';

interface InvitationRowProps{
    invitation: Invitation;
}

const InvitationRow = ({ invitation }: InvitationRowProps) => (
    <li className='flex min-h-13 items-center gap-4 border-b border-line px-4 py-2 last:border-b-0'>
        <span className='min-w-0 flex-1 truncate font-medium text-foreground'>{invitation.email}</span>
        <span className='shrink-0 tabular-nums text-subtle'>Expires {formatAgo(invitation.expiresAt)}</span>
        <InvitationActions invitation={invitation} />
    </li>
);

export default InvitationRow;
