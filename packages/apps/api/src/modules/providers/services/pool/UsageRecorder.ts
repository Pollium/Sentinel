import Provider from '../../models/Provider';
import Usage from '../../models/Usage';
import { eventBus } from '@pollium/readable/events/EventBus';
import { costOfTokens } from '@sentinel/contracts/providers/pricing';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { FastifyBaseLogger } from 'fastify';

interface UsageFields{
    provider: Provider;
    apiKeyId: string;
    kind: GatewayKind;
    model: string;
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
    latencyMs: number;
    status: number;
}

export default class UsageRecorder{
    async write(fields: UsageFields): Promise<Usage>{
        const price = fields.provider.models.find((model) => model.id === fields.model);

        const usage = await Usage.create({
            providerId: fields.provider.id,
            apiKeyId: fields.apiKeyId,
            kind: fields.kind,
            model: fields.model,
            inputTokens: fields.inputTokens,
            cachedTokens: fields.cachedTokens,
            outputTokens: fields.outputTokens,
            costUsd: costOfTokens(fields, price),
            latencyMs: fields.latencyMs,
            status: fields.status
        }).save();

        eventBus.emit('providers.usage.recorded', null);
        return usage;
    }

    async record(fields: UsageFields, log: FastifyBaseLogger){
        try{
            await this.write(fields);
        }catch(cause: unknown){
            log.error({ err: cause }, 'gateway usage record failed');
        }
    }
}

export const usageRecorder = new UsageRecorder();
