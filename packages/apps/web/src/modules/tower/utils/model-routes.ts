import { ProviderModel } from '@sentinel/contracts/providers/domain';
import { blankModel } from '@sentinel/ui/utils/format/provider-models';

export interface ModelRoute{
    model: ProviderModel;
    upstreamId: string;
}

export const blankRoute = (): ModelRoute => ({ model: blankModel(''), upstreamId: '' });

export const toRoutes = (models: ProviderModel[], modelMap: Record<string, string>): ModelRoute[] =>
    models.map((model) => ({ model, upstreamId: modelMap[model.id] ?? '' }));

const named = (route: ModelRoute): boolean => route.model.id.trim() !== '';

export const modelsOf = (routes: ModelRoute[]): ProviderModel[] =>
    routes.filter(named).map((route) => ({ ...route.model, id: route.model.id.trim() }));

const priced = (model: ProviderModel, discovered: ProviderModel): ProviderModel => ({
    ...model,
    inputPricePerMillion: model.inputPricePerMillion ?? discovered.inputPricePerMillion,
    cachedInputPricePerMillion: model.cachedInputPricePerMillion ?? discovered.cachedInputPricePerMillion,
    outputPricePerMillion: model.outputPricePerMillion ?? discovered.outputPricePerMillion,
    contextWindow: model.contextWindow ?? discovered.contextWindow
});

export const withDiscovered = (routes: ModelRoute[], discovered: ProviderModel[]): ModelRoute[] => {
    const byId = new Map(discovered.map((model) => [model.id, model]));

    const kept = routes.filter(named).map((route) => {
        const match = byId.get(route.model.id.trim());

        return match === undefined ? route : { ...route, model: priced(route.model, match) };
    });

    const known = new Set(kept.map((route) => route.model.id.trim()));
    const added = discovered
        .filter((model) => !known.has(model.id))
        .map((model) => ({ model, upstreamId: '' }));

    return [...kept, ...added];
};

export const modelMapOf = (routes: ModelRoute[]): Record<string, string> =>
    Object.fromEntries(routes
        .filter((route) => named(route) && route.upstreamId.trim() !== '')
        .map((route) => [route.model.id.trim(), route.upstreamId.trim()]));
