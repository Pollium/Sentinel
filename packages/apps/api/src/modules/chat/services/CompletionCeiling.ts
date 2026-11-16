import { ChatCompletionRequest } from '../contracts/domain/completion';

const LEGACY_FIELD = 'max_tokens';
const MODERN_FIELD = 'max_completion_tokens';
const REJECTION_CODE = 'unsupported_parameter';

interface RejectionBody{
    error?: {
        code?: string;
        param?: string;
    };
}

class CompletionCeiling{
    #modern = new Set<string>();

    shape(providerId: string, body: ChatCompletionRequest): ChatCompletionRequest{
        const ceiling = body[LEGACY_FIELD];
        if(ceiling === undefined || !this.#modern.has(providerId)) return body;

        const shaped: ChatCompletionRequest = { ...body, [MODERN_FIELD]: ceiling };
        delete shaped[LEGACY_FIELD];
        return shaped;
    }

    rejected(providerId: string, body: ChatCompletionRequest, payload: Buffer): boolean{
        if(body[LEGACY_FIELD] === undefined || this.#modern.has(providerId)) return false;

        const rejection = this.#parse(payload);
        return rejection?.error?.param === LEGACY_FIELD && rejection.error.code === REJECTION_CODE;
    }

    remember(providerId: string){
        this.#modern.add(providerId);
    }

    reset(){
        this.#modern.clear();
    }

    #parse(payload: Buffer): RejectionBody | null{
        try{
            return JSON.parse(payload.toString('utf8')) as RejectionBody;
        }catch{
            return null;
        }
    }
}

export const completionCeiling = new CompletionCeiling();
