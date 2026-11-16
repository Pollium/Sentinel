import { ErrorCode, ErrorTable } from '@sentinel/contracts/shared/errors';
import { ErrorCopy } from '../contracts/errors';
import { defineErrors } from '../errors/define-errors';
import { notifyError } from './notify';

const ClipboardErrors = {
    domain: 'Clipboard',
    causes: {
        WriteBlocked: 403
    }
} as const satisfies ErrorTable;

const ClipboardError = defineErrors(ClipboardErrors);

export type ClipboardErrorCode = ErrorCode<typeof ClipboardErrors>;

export const copyText = async (source: string, copy: ErrorCopy): Promise<boolean> => {
    try{
        await navigator.clipboard.writeText(source);

        return true;
    }catch{
        notifyError(ClipboardError.WriteBlocked(), copy, { title: 'Couldn\'t copy' });

        return false;
    }
};
