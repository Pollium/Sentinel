import Provider from '@/modules/providers/models/Provider';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { DiscoveredModels, ProviderModel } from '@sentinel/contracts/providers/domain';
import { DiscoverModelsInput } from '@sentinel/contracts/providers/http';
import { config } from '@/shared/config';
import { secretCipher } from '@/shared/cipher';
import { ProviderError } from '@/modules/providers/contracts/domain/errors';

const TRAILING_SLASH = /\/+$/;

const TOKENS_PER_MILLION = 1_000_000;

interface UpstreamPricing{
    prompt?: unknown;
    completion?: unknown;
    input_cache_read?: unknown;
}

interface UpstreamProvider{
    context_length?: unknown;
}

interface ModelListEntry{
    id?: unknown;
    pricing?: UpstreamPricing;
    context_length?: unknown;
    context_window?: unknown;
    max_model_len?: unknown;
    top_provider?: UpstreamProvider;
}

interface ModelListBody{
    data?: ModelListEntry[];
    models?: ModelListEntry[];
}

const perMillion = (raw: unknown): number | null => {
    if(typeof raw !== 'string' && typeof raw !== 'number') return null;

    const perToken = Number(raw);
    if(!Number.isFinite(perToken) || perToken <= 0) return null;

    return Number((perToken * TOKENS_PER_MILLION).toFixed(6));
};

const MIN_CONTEXT_TOKENS = 1024;

const tokens = (raw: unknown): number | null => {
    if(typeof raw !== 'string' && typeof raw !== 'number') return null;

    const count = Math.floor(Number(raw));
    if(!Number.isFinite(count) || count < MIN_CONTEXT_TOKENS) return null;

    return count;
};

const contextWindowOf = (entry: ModelListEntry): number | null =>
    tokens(entry.context_length)
        ?? tokens(entry.context_window)
        ?? tokens(entry.max_model_len)
        ?? tokens(entry.top_provider?.context_length);

const modelOf = (entry: ModelListEntry): ProviderModel | null => {
    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    if(id === '') return null;

    return {
        id,
        inputPricePerMillion: perMillion(entry.pricing?.prompt),
        cachedInputPricePerMillion: perMillion(entry.pricing?.input_cache_read),
        outputPricePerMillion: perMillion(entry.pricing?.completion),
        contextWindow: contextWindowOf(entry)
    };
};

const modelsOf = (payload: ModelListBody | undefined): ProviderModel[] => {
    const entries = payload?.data ?? payload?.models ?? [];
    const byId = new Map<string, ProviderModel>();

    for(const entry of entries){
        const model = modelOf(entry);
        if(model !== null && !byId.has(model.id)) byId.set(model.id, model);
    }

    return [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
};

export default class ModelDiscoveryService{
    async discover(input: DiscoverModelsInput): Promise<DiscoveredModels>{
        const apiKey = await this.#apiKey(input);
        const url = `${input.baseUrl.replace(TRAILING_SLASH, '')}/models`;
        let response: Response;

        try{
            response = await fetch(url, {
                headers: { authorization: `Bearer ${apiKey}` },
                signal: AbortSignal.timeout(config.upstreamFirstByteTimeoutMs)
            });
        }catch{
            throw ProviderError.ModelsUnreachable(url);
        }

        if(!response.ok) throw ProviderError.ModelsRejected(String(response.status));

        let payload: ModelListBody;
        try{
            payload = await response.json() as ModelListBody;
        }catch{
            throw ProviderError.ModelsRejected(url);
        }

        return { models: modelsOf(payload) };
    }

    async #apiKey(input: DiscoverModelsInput): Promise<string>{
        if(input.apiKey !== undefined) return input.apiKey;
        if(input.providerId === undefined) throw ProviderError.ModelsNeedKey(input.baseUrl);

        const provider = await findOrThrow(Provider, { id: input.providerId }, ProviderError.NotFound);

        return secretCipher.decrypt(provider.encryptedApiKey);
    }
}
