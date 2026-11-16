import ApiKey from '@/modules/keys/models/ApiKey';
import { hashOf, previewOf } from '@/modules/keys/utils/key-secret';

export const CLIENT_SECRET = 'snt_test-client-secret';

export const seedApiKey = (secret: string = CLIENT_SECRET, overrides: Partial<ApiKey> = {}): Promise<ApiKey> => {
    const key = ApiKey.create({
        name: 'Test client',
        keyHash: hashOf(secret),
        preview: previewOf(secret),
        isActive: true
    });

    return Object.assign(key, overrides).save();
};
