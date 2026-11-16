import { ProviderModel, ReasoningEffort } from '@sentinel/contracts/providers/domain';
import { ChatCompletionRequest } from '../contracts/domain/completion';

const EFFORT_FIELD = 'reasoning_effort';
const THINKING_FIELD = 'thinking';
const MESSAGES_FIELD = 'messages';
const ECHOED_REASONING_FIELDS = ['reasoning_content', 'reasoning'];
const LEGACY_CEILING = 'max_tokens';
const MODERN_CEILING = 'max_completion_tokens';

const DEFAULT_RESERVE = 2048;

const EFFORTS = new Set<string>(['low', 'medium', 'high']);

const asked = (body: ChatCompletionRequest): ReasoningEffort | null => {
    const raw = body[EFFORT_FIELD];
    if(typeof raw !== 'string' || !EFFORTS.has(raw)) return null;
    return raw as ReasoningEffort;
};

class ReasoningShape{
    apply(model: ProviderModel | undefined, body: ChatCompletionRequest): ChatCompletionRequest{
        const shaped: ChatCompletionRequest = { ...body };
        delete shaped[EFFORT_FIELD];
        delete shaped[THINKING_FIELD];

        const unechoed = ReasoningShape.#withoutEchoedReasoning(body[MESSAGES_FIELD]);
        if(unechoed !== null) shaped[MESSAGES_FIELD] = unechoed;

        const dialect = model?.reasoning ?? 'none';
        if(dialect === 'none') return shaped;

        const effort = asked(body) ?? model?.reasoningDefault ?? null;
        if(effort === null) return shaped;

        if(dialect === 'thinking'){
            shaped[THINKING_FIELD] = { type: 'enabled' };
        }else{
            shaped[EFFORT_FIELD] = effort;
        }

        return ReasoningShape.#reserve(model, shaped);
    }

    static #withoutEchoedReasoning(messages: unknown): unknown[] | null{
        if(!Array.isArray(messages)) return null;

        let echoed = false;
        const unechoed = messages.map((message: unknown) => {
            if(typeof message !== 'object' || message === null) return message;

            const carried = ECHOED_REASONING_FIELDS.filter((field) => field in message);
            if(carried.length === 0) return message;

            echoed = true;
            const stripped = { ...message } as Record<string, unknown>;
            for(const field of carried) delete stripped[field];

            return stripped;
        });

        return echoed ? unechoed : null;
    }

    static #reserve(model: ProviderModel | undefined, body: ChatCompletionRequest): ChatCompletionRequest{
        const reserve = model?.reasoningReserve ?? DEFAULT_RESERVE;
        if(reserve <= 0) return body;

        for(const field of [LEGACY_CEILING, MODERN_CEILING]){
            const ceiling = body[field];
            if(typeof ceiling === 'number' && Number.isFinite(ceiling)){
                body[field] = ceiling + reserve;
            }
        }

        return body;
    }
}

export const reasoningShape = new ReasoningShape();
