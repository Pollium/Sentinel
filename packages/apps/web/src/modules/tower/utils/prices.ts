import { ProviderModel, PublicGatewayProvider } from '@sentinel/contracts/providers/domain';

const SIGNIFICANT_DIGITS = 3;

export interface ServedModel{
    provider: PublicGatewayProvider;
    model: ProviderModel;
}

const perMillion = (price: number | null): string => price === null ? '—' : `$${Number(price.toPrecision(SIGNIFICANT_DIGITS))}`;

export const isPriced = (model: ProviderModel): boolean => model.inputPricePerMillion !== null || model.outputPricePerMillion !== null;

export const routesOf = (providers: PublicGatewayProvider[], modelId: string): ServedModel[] => providers.flatMap((provider) => {
    const model = provider.models.find((entry) => entry.id === modelId);
    return model === undefined ? [] : [{ provider, model }];
});

export const unpricedRoutes = (providers: PublicGatewayProvider[]): ServedModel[] => providers
    .filter((provider) => provider.isActive)
    .flatMap((provider) => provider.models.filter((model) => !isPriced(model)).map((model) => ({ provider, model })));

export const priceLine = (model: ProviderModel): string => isPriced(model)
    ? `${perMillion(model.inputPricePerMillion)} / ${perMillion(model.outputPricePerMillion)}`
    : 'No price';
