import Columns from '@sentinel/ui/components/Columns';
import EmptyChart from '@sentinel/ui/components/EmptyChart';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { GatewayUsageSlice } from '@sentinel/contracts/usage/domain';
import { dayLabel, fullLabel } from '@sentinel/ui/utils/format/chart-labels';
import { count, usd } from '@sentinel/ui/utils/format/format-metrics';

const LABELLED_DAYS = 14;
const PER_THOUSAND = 1000;

const captionOf = (costUsd: number, requests: number, unpricedRequests: number): string => {
    if(unpricedRequests > 0) return `per day · ${count(unpricedRequests)} requests had no price`;
    if(requests === 0) return 'per day';
    return `per day · ${usd((costUsd / requests) * PER_THOUSAND)} per 1,000 requests`;
};

interface SpendCellProps{
    slice: GatewayUsageSlice;
}

const SpendCell = ({ slice }: SpendCellProps) => {
    const { costUsd, requests, unpricedRequests } = slice.totals;
    const isLabelled = slice.days.length <= LABELLED_DAYS;

    return (
        <PanelCell
            title='Spend'
            figure={usd(costUsd)}
            caption={captionOf(costUsd, requests, unpricedRequests)}
            tone={unpricedRequests === 0 ? undefined : 'warning'}
        >
            {costUsd === 0 ? <EmptyChart>Nothing was spent in this period.</EmptyChart> : (
                <Columns
                    isQuiet
                    columns={slice.days.map((day) => ({
                        key: day.date,
                        label: isLabelled ? dayLabel(day.date) : '',
                        value: day.costUsd,
                        display: usd(day.costUsd),
                        note: fullLabel(day.date)
                    }))}
                />
            )}
        </PanelCell>
    );
};

export default SpendCell;
