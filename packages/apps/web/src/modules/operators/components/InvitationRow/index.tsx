import InvitationActions from '@/modules/operators/components/InvitationActions';
import { Invitation } from '@sentinel/contracts/invitations/domain';
import { formatAgo } from '@sentinel/ui/utils/format/format-date';

interface InvitationRowProps{
    invitation: Invitation;
}

const InvitationRow = ({ invitation }: InvitationRowProps) => (
    <li className='flex h-10 items-center gap-3 px-3'>
        <span className='min-w-0 flex-1 truncate text-[0.8125rem] text-foreground'>{invitation.email}</span>
        <span className='shrink-0 text-[0.75rem] tabular-nums text-muted'>Expires {formatAgo(invitation.expiresAt)}</span>
        <InvitationActions invitation={invitation} />
    </li>
);

export default InvitationRow;
