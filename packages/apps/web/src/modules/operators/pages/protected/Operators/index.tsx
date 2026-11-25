import InviteButton from '@/modules/operators/components/InviteButton';
import InvitationRow from '@/modules/operators/components/InvitationRow';
import OperatorGroup from '@/modules/operators/components/OperatorGroup';
import OperatorRow from '@/modules/operators/components/OperatorRow';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import SkeletonList from '@sentinel/ui/components/SkeletonList';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { SessionOutlet } from '@sentinel/ui/contracts/session';
import { useOutletContext } from 'react-router-dom';
import { REQUEST_INTERRUPTED } from '@sentinel/ui/utils/format/state-copy';

const SKELETON_ROWS = 3;

const SKELETON = <SkeletonList count={SKELETON_ROWS} />;

const Operators = () => {
    const operators = useQuery(operatorRoutes.list);
    const invitations = useQuery(invitationRoutes.list);
    const { operator: self } = useOutletContext<SessionOutlet>();

    return (
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-16 pt-7 sm:px-8'>
            <PageToolbar title='Operators'>
                <InviteButton joinedEmails={operators.data?.map(({ email }) => email) ?? []} />
            </PageToolbar>

            <QueryState
                query={operators}
                errorTitle='The operators could not be loaded'
                errorDescription={REQUEST_INTERRUPTED}
                skeleton={SKELETON}
            >
                {(loaded) => (
                    <OperatorGroup label='Joined' total={loaded.length}>
                        {loaded.map((listed) => (
                            <OperatorRow
                                key={listed.id}
                                operator={listed.id === self.id ? self : listed}
                                isSelf={listed.id === self.id}
                            />
                        ))}
                    </OperatorGroup>
                )}
            </QueryState>

            <QueryState
                query={invitations}
                errorTitle='The invitations could not be loaded'
                errorDescription={REQUEST_INTERRUPTED}
                skeleton={SKELETON}
                empty={null}
            >
                {(loaded) => (
                    <OperatorGroup label='Invited' total={loaded.length}>
                        {loaded.map((invitation) => (
                            <InvitationRow key={invitation.id} invitation={invitation} />
                        ))}
                    </OperatorGroup>
                )}
            </QueryState>
        </div>
    );
};

export default Operators;
