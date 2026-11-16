import { ProviderModel } from '@sentinel/contracts/providers/domain';

export const blankModel = (id: string): ProviderModel => ({
    id,
    inputPricePerMillion: null,
    cachedInputPricePerMillion: null,
    outputPricePerMillion: null,
    reasoning: 'none',
    reasoningDefault: null,
    reasoningReserve: null,
    contextWindow: null
});

export const MODEL_GRID = 'grid items-center gap-1.5 grid-cols-[minmax(7rem,1fr)_minmax(7rem,1fr)_3.5rem_3.5rem_3.5rem_6rem_5rem_2rem]';
