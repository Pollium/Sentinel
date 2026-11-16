import { CompletionChunk } from '../contracts/domain/completion';

interface SseUsageInfo{
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
}

const parsePayload = (payload: string): CompletionChunk | null => {
    try{
        return JSON.parse(payload) as CompletionChunk;
    }catch{
        return null;
    }
};

export const tapSseUsage = (source: ReadableStream<Uint8Array>): {
    stream: ReadableStream<Uint8Array>;
    info: SseUsageInfo;
} => {
    const info: SseUsageInfo = { inputTokens: 0, cachedTokens: 0, outputTokens: 0 };
    const decoder = new TextDecoder();
    let buffer = '';

    const absorb = (chunk: CompletionChunk) => {
        if(chunk.usage === undefined || chunk.usage === null) return;

        info.inputTokens = chunk.usage.prompt_tokens ?? info.inputTokens;
        info.outputTokens = chunk.usage.completion_tokens ?? info.outputTokens;
        info.cachedTokens = chunk.usage.prompt_tokens_details?.cached_tokens ?? info.cachedTokens;
    };

    const scan = () => {
        const cutoff = buffer.lastIndexOf('\n');
        if(cutoff === -1) return;

        const complete = buffer.slice(0, cutoff);
        buffer = buffer.slice(cutoff + 1);

        for(const rawLine of complete.split('\n')){
            const line = rawLine.trim();
            if(!line.startsWith('data:')) continue;

            const payload = line.slice('data:'.length).trim();
            if(payload === '' || payload === '[DONE]') continue;

            const chunk = parsePayload(payload);
            if(chunk !== null) absorb(chunk);
        }
    };

    const stream = source.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller){
            controller.enqueue(chunk);
            buffer += decoder.decode(chunk, { stream: true });
            scan();
        },
        flush(){
            buffer += decoder.decode();
            scan();
        }
    }));

    return {
        stream,
        info
    };
};
