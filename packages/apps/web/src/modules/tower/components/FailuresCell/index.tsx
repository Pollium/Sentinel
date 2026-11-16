import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import RankedBars from '@sentinel/ui/components/RankedBars';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { tenths } from '@sentinel/ui/utils/format/tenths';
import { failureBars } from '@/modules/tower/utils/failures';

interface FailuresCellProps{
    slice: GatewayUsageSlice;
}

const FailuresCell = ({ slice }: FailuresCellProps) => {
    const { requests, failedAttempts } = slice.totals;

    return (
        <PanelCell
            title='Failed attempts'
            figure={count(failedAttempts)}
            caption={`${tenths(failedAttempts, requests + failedAttempts)} of upstream attempts · by reason`}
        >
            {failedAttempts === 0 ? <EmptyChart>No attempt failed in this period.</EmptyChart> : <RankedBars bars={failureBars(slice.failures)} />}
        </PanelCell>
    );
};

export default FailuresCell;
