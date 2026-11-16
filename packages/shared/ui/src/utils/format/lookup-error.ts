import { baseCodeOf } from '@sentinel/contracts/shared/errors';
import { ErrorCopy } from '../../contracts/errors';

export const lookupError = <C extends string>(messages: Partial<Record<C, string>>): ErrorCopy =>
    ((source: Error | string | undefined) => {
        if(source === undefined) return null;
        const message = typeof source === 'string' ? source : source.message;
        const code = baseCodeOf(message);

        return (code in messages ? messages[code as C] : undefined) ?? message;
    }) as ErrorCopy;
