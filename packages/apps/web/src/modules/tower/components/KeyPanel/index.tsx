import CalledModelsCell from '@/modules/tower/components/CalledModelsCell';
import FailuresCell from '@/modules/tower/components/FailuresCell';
import KeyFactsCell from '@/modules/tower/components/KeyFactsCell';
import KeyHeader from '@/modules/tower/components/KeyHeader';
import KindsCell from '@/modules/tower/components/KindsCell';
import LatencyCell from '@/modules/tower/components/LatencyCell';
import LoadCell from '@/modules/tower/components/LoadCell';
import RequestsCell from '@/modules/tower/components/RequestsCell';
import ServedByCell from '@/modules/tower/components/ServedByCell';
import SpendCell from '@/modules/tower/components/SpendCell';
import PanelGrid from '@sentinel/ui/components/PanelGrid';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';
import { trendCaption } from '@/modules/tower/utils/windows';

interface KeyPanelProps{
    apiKey: PublicGatewayApiKey;
    slice: GatewayUsageSlice;
    onRevoked: () => void;
}

const KeyPanel = ({ apiKey, slice, onRevoked }: KeyPanelProps) => (
    <div className='flex flex-col gap-10'>
        <KeyHeader apiKey={apiKey} onRevoked={onRevoked} />

        <PanelGrid>
            <RequestsCell slice={slice} caption={trendCaption(slice.window)} />
            <SpendCell slice={slice} />
            <CalledModelsCell slice={slice} />
            <KindsCell slice={slice} />
            <ServedByCell slice={slice} />
            <FailuresCell slice={slice} />
            <LatencyCell totals={slice.totals} />
            <LoadCell title='When it calls' hours={slice.hours} />
            <KeyFactsCell apiKey={apiKey} />
        </PanelGrid>
    </div>
);

export default KeyPanel;
