import { notifyError } from './notify';
import { defineErrors } from '@pollium/readable-contracts/errors';
import { ErrorCopy } from '@pollium/readable-react/errors/copy';

const ClipboardErrors = defineErrors({
    domain: 'Clipboard',
    causes: {
        WriteBlocked: 403
    }
});

export const copyText = async (source: string, copy: ErrorCopy): Promise<boolean> => {
    try{
        await navigator.clipboard.writeText(source);

        return true;
    }catch{
        notifyError(ClipboardErrors.WriteBlocked(), copy, { title: 'Couldn\'t copy' });

        return false;
    }
};
