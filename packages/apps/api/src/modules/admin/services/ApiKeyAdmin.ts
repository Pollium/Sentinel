import ApiKey from '@/modules/keys/models/ApiKey';
import Usage from '@/modules/providers/models/Usage';
import { findOrThrow } from '@pollium/readable/database/queries';
import { IssuedGatewayApiKey, PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { CreateApiKeyInput, UpdateApiKeyInput } from '@sentinel/contracts/keys/http';
import { hashOf, newSecret, previewOf } from '@/modules/keys/utils/key-secret';
import { ApiKeyError } from '@/modules/keys/contracts/domain/errors';

interface ActivityRow{
    apiKeyId: string;
    requests: string;
    lastUsedAt: Date | null;
}

interface Activity{
    requests: number;
    lastUsedAt: string | null;
}

export default class ApiKeyAdminService{
    async list(): Promise<PublicGatewayApiKey[]>{
        const [keys, activity] = await Promise.all([
            ApiKey.find({ order: { id: 'ASC' } }),
            ApiKeyAdminService.#activity()
        ]);

        return keys.map((key) => ApiKeyAdminService.#view(key, activity.get(key.id)));
    }

    async create(input: CreateApiKeyInput): Promise<IssuedGatewayApiKey>{
        const secret = newSecret();

        const key = await ApiKey.create({
            ...input,
            keyHash: hashOf(secret),
            preview: previewOf(secret)
        }).save();

        return {
            key: ApiKeyAdminService.#view(key, undefined),
            secret
        };
    }

    async update(keyId: string, patch: UpdateApiKeyInput): Promise<PublicGatewayApiKey>{
        const key = await findOrThrow(ApiKey, { id: keyId }, ApiKeyError.NotFound);

        if(patch.name !== undefined) key.name = patch.name;
        if(patch.isActive !== undefined) key.isActive = patch.isActive;
        await key.save();

        const activity = await ApiKeyAdminService.#activity();
        return ApiKeyAdminService.#view(key, activity.get(key.id));
    }

    async remove(keyId: string){
        const key = await findOrThrow(ApiKey, { id: keyId }, ApiKeyError.NotFound);
        await key.remove();
    }

    static async #activity(): Promise<Map<string, Activity>>{
        const rows = await Usage.createQueryBuilder('usage')
            .select('usage."apiKeyId"', 'apiKeyId')
            .addSelect('COUNT(*)', 'requests')
            .addSelect('MAX(usage."createdAt")', 'lastUsedAt')
            .where('usage."apiKeyId" IS NOT NULL')
            .groupBy('usage."apiKeyId"')
            .getRawMany<ActivityRow>();

        return new Map(rows.map((row) => [row.apiKeyId, {
            requests: Number(row.requests),
            lastUsedAt: row.lastUsedAt?.toISOString() ?? null
        }]));
    }

    static #view(key: ApiKey, activity: Activity | undefined): PublicGatewayApiKey{
        return {
            id: key.id,
            createdAt: key.createdAt.toISOString(),
            updatedAt: key.updatedAt.toISOString(),
            name: key.name,
            preview: key.preview,
            isActive: key.isActive,
            requests: activity?.requests ?? 0,
            lastUsedAt: activity?.lastUsedAt ?? null
        };
    }
}
