import { BEARER_AUTH, SUBSCRIPTION_AUTH, authenticateClient } from '../services/authenticate';
import { useApp } from '@tests/harness';
import { CLIENT_SECRET, seedApiKey } from '@tests/seed';
import { describe, expect, it } from 'vitest';

const EARLIER_SECRET = 'old_issued-before-the-current-prefix';

describe('authenticateClient', () => {
    useApp();

    it('rejects a key nobody issued', async () => {
        await seedApiKey();

        await expect(authenticateClient({ authorization: 'Bearer snt_nobody' }, BEARER_AUTH))
            .rejects.toThrow('ApiKey::Unauthorized');
    });

    it('accepts a live key whatever prefix it was issued under', async () => {
        const key = await seedApiKey(EARLIER_SECRET);

        await expect(authenticateClient({ authorization: `Bearer ${EARLIER_SECRET}` }, BEARER_AUTH))
            .resolves.toMatchObject({ id: key.id });
    });

    it('rejects a deactivated key', async () => {
        await seedApiKey(CLIENT_SECRET, { isActive: false });

        await expect(authenticateClient({ authorization: `Bearer ${CLIENT_SECRET}` }, BEARER_AUTH))
            .rejects.toThrow('ApiKey::Unauthorized');
    });

    it('rejects a missing header', async () => {
        await expect(authenticateClient({}, BEARER_AUTH)).rejects.toThrow('ApiKey::Unauthorized');
    });

    it('rejects a bare key under a prefixed shape', async () => {
        await seedApiKey();

        await expect(authenticateClient({ authorization: CLIENT_SECRET }, BEARER_AUTH))
            .rejects.toThrow('ApiKey::Unauthorized');
    });

    it('rejects a prefixed key under the bare shape', async () => {
        await seedApiKey();

        await expect(authenticateClient({ 'x-subscription-token': `Bearer ${CLIENT_SECRET}` }, SUBSCRIPTION_AUTH))
            .rejects.toThrow('ApiKey::Unauthorized');
    });
});
