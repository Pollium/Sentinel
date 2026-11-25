import FailuresCell from '@/modules/tower/components/FailuresCell';
import KeysCell from '@/modules/tower/components/KeysCell';
import LatencyCell from '@/modules/tower/components/LatencyCell';
import ProviderFactsCell from '@/modules/tower/components/ProviderFactsCell';
import ProviderHeader from '@/modules/tower/components/ProviderHeader';
import ProviderModelsCell from '@/modules/tower/components/ProviderModelsCell';
import ProviderPricesCell from '@/modules/tower/components/ProviderPricesCell';
import RequestsCell from '@/modules/tower/components/RequestsCell';
import SpendCell from '@/modules/tower/components/SpendCell';
import PanelGrid from '@sentinel/ui/components/PanelGrid';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { trendCaption } from '@/modules/tower/utils/windows';

interface ProviderPanelProps{
    provider: PublicGatewayProvider;
    slice: GatewayUsageSlice;
    share: string;
    onRemoved: () => void;
}

const ProviderPanel = ({ provider, slice, share, onRemoved }: ProviderPanelProps) => {
    const isChat = provider.kind === 'chat';

    return (
        <div className='flex flex-col'>
            <ProviderHeader provider={provider} share={share} onRemoved={onRemoved} />

            <PanelGrid>
                <RequestsCell slice={slice} caption={trendCaption(slice.window)} />
                <FailuresCell slice={slice} />
                <LatencyCell totals={slice.totals} />
                {isChat ? <SpendCell slice={slice} /> : null}
                <ProviderModelsCell provider={provider} slice={slice} />
                {isChat ? <ProviderPricesCell models={provider.models} /> : null}
                <KeysCell slice={slice} caption='keys it served · requests by key' />
                <ProviderFactsCell provider={provider} lastRequestAt={slice.lastRequestAt} />
            </PanelGrid>
        </div>
    );
};

export default ProviderPanel;
