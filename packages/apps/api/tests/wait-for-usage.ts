import Failure from '@/modules/providers/models/Failure';
import Usage from '@/modules/providers/models/Usage';

const ATTEMPTS = 100;
const PAUSE_MS = 10;

const poll = async <T>(find: () => Promise<T | null>, what: string): Promise<T> => {
    for(let attempt = 0; attempt < ATTEMPTS; attempt++){
        const found = await find();
        if(found !== null) return found;
        await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
    }

    throw new Error(`${what} was never recorded`);
};

export const waitForUsage = (providerId: string): Promise<Usage> =>
    poll(() => Usage.findOneBy({ providerId }), 'usage');

export const waitForFailure = (providerId: string): Promise<Failure> =>
    poll(() => Failure.findOneBy({ providerId }), 'failure');
