import Failure from '../../models/Failure';
import Provider from '../../models/Provider';
import { eventBus } from '@readable/events/EventBus';
import { GatewayFailureCause } from '@sentinel/contracts/usage/domain';
import { FastifyBaseLogger } from 'fastify';

export const NO_STATUS = 0;

interface FailureFields{
    provider: Provider;
    apiKeyId: string;
    model: string;
    cause: GatewayFailureCause;
    status: number;
    latencyMs: number;
}

class FailureRecorder{
    async write(fields: FailureFields): Promise<Failure>{
        const failure = await Failure.create({
            providerId: fields.provider.id,
            apiKeyId: fields.apiKeyId,
            kind: fields.provider.kind,
            model: fields.model,
            cause: fields.cause,
            status: fields.status,
            latencyMs: fields.latencyMs
        }).save();

        eventBus.emit('providers.failure.recorded', null);
        return failure;
    }

    async record(fields: FailureFields, log: FastifyBaseLogger){
        try{
            await this.write(fields);
        }catch(cause: unknown){
            log.error({ err: cause }, 'gateway failure record failed');
        }
    }
}

export const failureRecorder = new FailureRecorder();
