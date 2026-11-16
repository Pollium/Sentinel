import { ProviderModel } from './domain';

const TOKENS_PER_MILLION = 1_000_000;

interface TokenCounts{
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
}

export const costOfTokens = (tokens: TokenCounts, price: ProviderModel | undefined): number => {
    if(price === undefined) return 0;

    const input = price.inputPricePerMillion ?? 0;
    const cached = price.cachedInputPricePerMillion ?? input;
    const uncachedTokens = Math.max(0, tokens.inputTokens - tokens.cachedTokens);

    const perMillion = uncachedTokens * input
        + tokens.cachedTokens * cached
        + tokens.outputTokens * (price.outputPricePerMillion ?? 0);

    return perMillion / TOKENS_PER_MILLION;
};
