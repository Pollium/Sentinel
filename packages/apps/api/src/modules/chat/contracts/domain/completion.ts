export interface ChatCompletionRequest{
    model: string;
    stream?: boolean;
    [field: string]: unknown;
}

interface PromptTokensDetails{
    cached_tokens?: number;
}

export interface CompletionUsage{
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: PromptTokensDetails | null;
}

export interface CompletionChunk{
    usage?: CompletionUsage | null;
}
