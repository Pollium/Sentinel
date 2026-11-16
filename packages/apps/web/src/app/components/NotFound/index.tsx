import AuthShell from '@sentinel/ui/components/AuthShell';
import AuthHeading from '@/modules/auth/components/AuthHeading';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <AuthShell>
            <AuthHeading title='This page does not exist'>
                The link may be cut short or out of date.
            </AuthHeading>
            <Button fullWidth onPress={() => void navigate('/')}>Go to Sentinel</Button>
        </AuthShell>
    );
};

export default NotFound;
