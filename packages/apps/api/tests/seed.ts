import ApiKey from '@/modules/keys/models/ApiKey';
import Failure from '@/modules/providers/models/Failure';
import Provider from '@/modules/providers/models/Provider';
import Usage from '@/modules/providers/models/Usage';
import SecretCipher from '@readable/services/SecretCipher';
import { GatewayKind, ProviderModel } from '@sentinel/contracts/providers/domain';
import { config } from '@/shared/config';
import { ObjectLiteral, Repository } from 'typeorm';
import { hashOf, previewOf } from '@/modules/keys/utils/key-secret';

const cipher = new SecretCipher(config.encryptionKey);

export const CLIENT_SECRET = 'snt_test-client-secret';

export const pricedModel = (id: string, prices: Partial<ProviderModel> = {}): ProviderModel => ({
    id,
    inputPricePerMillion: null,
    cachedInputPricePerMillion: null,
    outputPricePerMillion: null,
    ...prices
});

export const seedProvider = (kind: GatewayKind, overrides: Partial<Provider> = {}): Promise<Provider> => {
    const provider = Provider.create({
        kind,
        name: 'Provider',
        baseUrl: 'https://upstream.test/v1',
        encryptedApiKey: cipher.encrypt('sk-test'),
        isActive: true,
        models: [],
        modelMap: {}
    });

    return Object.assign(provider, overrides).save();
};

export const seedApiKey = (secret: string = CLIENT_SECRET, overrides: Partial<ApiKey> = {}): Promise<ApiKey> => {
    const key = ApiKey.create({
        name: 'Test client',
        keyHash: hashOf(secret),
        preview: previewOf(secret),
        isActive: true
    });

    return Object.assign(key, overrides).save();
};

interface UsageSeed extends Partial<Usage>{
    providerId: string;
    apiKeyId: string;
    at?: Date;
}

interface FailureSeed extends Partial<Failure>{
    providerId: string;
    apiKeyId: string;
    at?: Date;
}

const backdate = async <T extends ObjectLiteral>(repository: Repository<T>, id: string, at: Date | undefined) => {
    if(at === undefined) return;

    const { schema, tableName } = repository.metadata;
    await repository.query(`UPDATE "${schema}"."${tableName}" SET "createdAt" = $1 WHERE id = $2`, [at.toISOString(), id]);
};

export const seedUsage = async ({ at, ...fields }: UsageSeed): Promise<Usage> => {
    const usage = await Usage.create({
        kind: 'chat',
        model: 'gpt-5-mini',
        inputTokens: 10,
        cachedTokens: 0,
        outputTokens: 4,
        costUsd: 0,
        latencyMs: 100,
        status: 200,
        ...fields
    }).save();

    await backdate(Usage.getRepository(), usage.id, at);
    return usage;
};

const FAILURE_DEFAULTS: Partial<Failure> = {
    kind: 'chat',
    model: 'gpt-5-mini',
    cause: 'rejected',
    status: 429,
    latencyMs: 50
};

export const seedFailure = async ({ at, ...fields }: FailureSeed): Promise<Failure> => {
    const failure = await Object.assign(Failure.create(), FAILURE_DEFAULTS, fields).save();

    await backdate(Failure.getRepository(), failure.id, at);
    return failure;
};
