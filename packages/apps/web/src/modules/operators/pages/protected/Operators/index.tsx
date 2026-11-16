import InviteForm from '@/modules/operators/components/InviteForm';
import InvitationRow from '@/modules/operators/components/InvitationRow';
import OperatorRow from '@/modules/operators/components/OperatorRow';
import ListGroup from '@sentinel/ui/components/ListGroup';
import PageToolbar from '@sentinel/ui/components/PageToolbar';
import QueryState from '@sentinel/ui/components/QueryState';
import SkeletonList from '@sentinel/ui/components/SkeletonList';
import { useQuery } from '@sentinel/ui/hooks/api/use-query';
import { SessionOutlet } from '@sentinel/ui/contracts/session';
import { operatorsApi } from '@/modules/operators/api/api';
import { useOutletContext } from 'react-router-dom';

const SKELETON_ROWS = 3;

const SKELETON = <SkeletonList count={SKELETON_ROWS} className='flex flex-col gap-2 px-3' itemClassName='h-7 w-full rounded-lg' />;

const Operators = () => {
    const operators = useQuery(operatorsApi.list, []);
    const invitations = useQuery(operatorsApi.invitations, []);
    const { operator: self } = useOutletContext<SessionOutlet>();

    return (
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-8'>
            <PageToolbar title='Operators' />

            <p className='px-3 text-[0.875rem] text-muted'>
                Everyone here can change providers, keys and operators. Nobody can remove themselves.
            </p>

            <InviteForm joinedEmails={operators.data?.map(({ email }) => email) ?? []} onInvited={invitations.reload} />

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
                                    onRemoved={operators.reload}
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
                isEmpty={(loaded) => loaded?.length === 0}
            >
                {(loaded) => (
                    <ListGroup label='Invited' total={loaded.length} tone={null}>
                        <ul className='flex flex-col'>
                            {loaded.map((invitation) => (
                                <InvitationRow key={invitation.id} invitation={invitation} onRevoked={invitations.reload} />
                            ))}
                        </ul>
                    </ListGroup>
                )}
            </QueryState>
        </div>
    );
};

export default Operators;
