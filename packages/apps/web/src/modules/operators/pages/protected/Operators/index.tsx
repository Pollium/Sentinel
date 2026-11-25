import InviteButton from '@/modules/operators/components/InviteButton';
import InvitationRow from '@/modules/operators/components/InvitationRow';
import OperatorRow from '@/modules/operators/components/OperatorRow';
import ListGroup from '@sentinel/ui/components/ListGroup';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import SkeletonList from '@sentinel/ui/components/SkeletonList';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { operatorRoutes } from '@sentinel/contracts/operators/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { SessionOutlet } from '@sentinel/ui/contracts/session';
import { useOutletContext } from 'react-router-dom';

const SKELETON_ROWS = 3;

const SKELETON = <SkeletonList count={SKELETON_ROWS} className='flex flex-col gap-2 px-3' itemClassName='h-7 w-full rounded-lg' />;

const Operators = () => {
    const operators = useQuery(operatorRoutes.list);
    const invitations = useQuery(invitationRoutes.list);
    const { operator: self } = useOutletContext<SessionOutlet>();

    return (
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-8'>
            <PageToolbar title='Operators'>
                <InviteButton joinedEmails={operators.data?.map(({ email }) => email) ?? []} />
            </PageToolbar>

            <QueryState
                query={operators}
                errorTitle='The operators could not be loaded'
                errorDescription='Something interrupted the request. Check that the gateway is running and try again.'
                skeleton={SKELETON}
            >
                {(loaded) => (
                    <ListGroup label='Joined' total={loaded.length} tone={null}>
                        <ul className='flex flex-col'>
                            {loaded.map((listed) => (
                                <OperatorRow
                                    key={listed.id}
                                    operator={listed.id === self.id ? self : listed}
                                    isSelf={listed.id === self.id}
                                />
                            ))}
                        </ul>
                    </ListGroup>
                )}
            </QueryState>

            <QueryState
                query={invitations}
                errorTitle='The invitations could not be loaded'
                errorDescription='Something interrupted the request. Check that the gateway is running and try again.'
                skeleton={SKELETON}
                empty={null}
            >
                {(loaded) => (
                    <ListGroup label='Invited' total={loaded.length} tone={null}>
                        <ul className='flex flex-col'>
                            {loaded.map((invitation) => (
                                <InvitationRow key={invitation.id} invitation={invitation} />
                            ))}
                        </ul>
                    </ListGroup>
                )}
            </QueryState>
        </div>
    );
};

export default Operators;
