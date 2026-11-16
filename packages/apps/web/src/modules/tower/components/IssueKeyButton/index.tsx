import ApiKeyForm from '@/modules/tower/components/ApiKeyForm';
import CopyOnce from '@sentinel/ui/components/CopyOnce';
import Modal from '@sentinel/ui/components/Modal';
import { IssuedGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { errorCopy } from '@/modules/tower/utils/error-copy';
import { Button } from '@heroui/react';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';

const KEY_SHOWN_ONCE = 'This is the only time the gateway shows it. Paste it into the client that will call the gateway — as a bearer token for chat, a Deepgram token for voice, or the subscription token for search.';

interface IssueKeyButtonProps{
    onIssued: () => void;
}

const IssueKeyButton = ({ onIssued }: IssueKeyButtonProps) => {
    const [isOpen, setOpen] = useState(false);
    const [issued, setIssued] = useState<IssuedGatewayApiKey | null>(null);

    const close = () => {
        setOpen(false);
        setIssued(null);
    };

    return (
        <>
            <Button size='sm' variant='ghost' aria-label='Issue a key' className='shrink-0 gap-1.5 text-muted hover:text-foreground max-sm:px-2' onPress={() => setOpen(true)}>
                <KeyRound className='size-4' aria-hidden='true' />
                <span className='hidden sm:inline'>Issue key</span>
            </Button>

            <Modal isOpen={isOpen} onOpenChange={(next) => next ? setOpen(true) : close()} title={issued === null ? 'Issue an API key' : 'Copy the key now'}>
                {issued === null ? (
                    <ApiKeyForm
                        apiKey={null}
                        onDone={(next) => {
                            setIssued(next);
                            onIssued();
                        }}
                    />
                ) : (
                    <CopyOnce
                        value={issued.secret}
                        description={KEY_SHOWN_ONCE}
                        copyLabel='Copy the key'
                        errorCopy={errorCopy}
                        onDone={close}
                    />
                )}
            </Modal>
        </>
    );
};

export default IssueKeyButton;
