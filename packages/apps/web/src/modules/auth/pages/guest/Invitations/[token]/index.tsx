import AuthShell from '@sentinel/ui/components/AuthShell';
import Loader from '@sentinel/ui/components/Loader';
import QueryState from '@sentinel/ui/components/QueryState';
import AuthHeading from '@/modules/auth/components/AuthHeading';
import InvitationForm from '@/modules/auth/components/InvitationForm';
import { InvitationErrorCode } from '@sentinel/contracts/invitations/errors';
import { AcceptInvitationInput } from '@sentinel/contracts/invitations/http';
import { invitationRoutes } from '@sentinel/contracts/invitations/routes';
import { ApiError } from '@pollium/readable-react/http/ApiError';
import { call } from '@pollium/readable-react/http/call';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { session } from '@pollium/readable-react/session/session';
import { Button } from '@heroui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GONE: InvitationErrorCode = 'Invitation::NotFound';

const isGone = (error: unknown): boolean => error instanceof ApiError && error.code === GONE;

const Invitation = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const preview = useQuery(invitationRoutes.preview, { path: { token } });
    const [expired, setExpired] = useState(false);

    const accept = async (values: AcceptInvitationInput) => {
        try{
            const accepted = await call(invitationRoutes.accept, { path: { token }, body: values });
            session.start(accepted.token);
        }catch(error: unknown){
            if(!isGone(error)) throw error;
            setExpired(true);
        }
    };

    if(expired || isGone(preview.error)){
        return (
            <AuthShell>
                <AuthHeading title='This link no longer works'>
                    Invitations expire and work only once.
                </AuthHeading>
                <Button fullWidth onPress={() => void navigate('/sign-in')}>Back to sign in</Button>
            </AuthShell>
        );
    }

    return (
        <AuthShell>
            <QueryState
                query={preview}
                errorTitle='The invitation could not be opened'
                errorDescription='Something interrupted the request. Check your connection and try again.'
                skeleton={<Loader label='Opening the invitation' className='h-72' />}
            >
                {(invitation) => <InvitationForm invitation={invitation} onAccept={accept} />}
            </QueryState>
        </AuthShell>
    );
};

export default Invitation;
