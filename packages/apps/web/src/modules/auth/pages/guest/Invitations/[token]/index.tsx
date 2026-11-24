import AuthShell from '@sentinel/ui/components/AuthShell';
import Loader from '@sentinel/ui/components/Loader';
import QueryState from '@sentinel/ui/components/QueryState';
import AuthHeading from '@/modules/auth/components/AuthHeading';
import InvitationForm from '@/modules/auth/components/InvitationForm';
import { InvitationErrorCode } from '@sentinel/contracts/invitations/errors';
import { AcceptInvitationInput } from '@sentinel/contracts/invitations/http';
import { baseCodeOf } from '@pollium/readable-contracts/errors';
import { useQuery } from '@sentinel/ui/hooks/api/use-query';
import { toError } from '@sentinel/ui/utils/format/errors';
import { authApi } from '@/modules/auth/api/api';
import { startSession } from '@/modules/auth/utils/start-session';
import { Button } from '@heroui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GONE: InvitationErrorCode = 'Invitation::NotFound';

const isGone = (error: Error | undefined): boolean => error !== undefined && baseCodeOf(error.message) === GONE;

const Invitation = () => {
    const navigate = useNavigate();
    const { token = '' } = useParams();
    const preview = useQuery(authApi.previewInvitation, [token]);
    const [expired, setExpired] = useState(false);

    const accept = async (values: AcceptInvitationInput) => {
        try{
            await startSession(await authApi.acceptInvitation(token, values));
        }catch(error: unknown){
            if(!isGone(toError(error))) throw error;
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
