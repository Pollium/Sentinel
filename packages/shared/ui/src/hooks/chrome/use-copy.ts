import { Copyable } from '../../contracts/copy';
import { ErrorCopy } from '../../contracts/errors';
import { copyText } from '../../services/clipboard';
import { useState } from 'react';

const COPIED_MS = 2000;

export const useCopy = (source: string, copy: ErrorCopy): Copyable => {
    const [copied, setCopied] = useState(false);

    return {
        copied,
        copy: async () => {
            if(!await copyText(source, copy)) return;

            setCopied(true);
            setTimeout(() => setCopied(false), COPIED_MS);
        }
    };
};
