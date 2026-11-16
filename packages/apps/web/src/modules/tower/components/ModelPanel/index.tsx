import FailuresCell from '@/modules/tower/components/FailuresCell';
import KeysCell from '@/modules/tower/components/KeysCell';
import LatencyCell from '@/modules/tower/components/LatencyCell';
import ModelPricesCell from '@/modules/tower/components/ModelPricesCell';
import ServedByCell from '@/modules/tower/components/ServedByCell';
import ModelTokensCell from '@/modules/tower/components/ModelTokensCell';
import RequestsCell from '@/modules/tower/components/RequestsCell';
import SpendCell from '@/modules/tower/components/SpendCell';
import PanelGrid from '@sentinel/ui/components/PanelGrid';
import { GatewayKind } from '@sentinel/contracts/providers/domain';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { KIND_LABEL } from '@/modules/tower/utils/kinds';
import { ServedModel } from '@/modules/tower/utils/prices';
import { trendCaption } from '@/modules/tower/utils/windows';

interface ModelPanelProps{
    model: string;
    kind: GatewayKind;
    slice: GatewayUsageSlice;
    routes: ServedModel[];
}

const ModelPanel = ({ model, kind, slice, routes }: ModelPanelProps) => {
    const isChat = kind === 'chat';
    const serving = isChat ? routes.length : slice.providers.length;

    return (
        <div className='flex flex-col gap-10'>
            <header>
                <h2 className='break-all text-xl font-semibold text-foreground'>{model}</h2>
                <p className='mt-0.5 text-[0.8125rem] text-muted'>{KIND_LABEL[kind]} · served by {count(serving)} {serving === 1 ? 'provider' : 'providers'}</p>
            </header>

            <PanelGrid>
                <RequestsCell slice={slice} caption={trendCaption(slice.window)} />
                {isChat ? <SpendCell slice={slice} /> : null}
                <ServedByCell slice={slice} />
                <KeysCell slice={slice} caption='keys that called it · requests by key' />
                <LatencyCell totals={slice.totals} />
                <FailuresCell slice={slice} />
                {isChat ? <ModelTokensCell totals={slice.totals} contextWindow={routes.at(0)?.model.contextWindow ?? null} /> : null}
                {isChat ? <ModelPricesCell routes={routes} /> : null}
            </PanelGrid>
        </div>
    );
};

export default ModelPanel;
