import EmptyChart from '@sentinel/ui/components/EmptyChart';
import LoadHeatmap from '@sentinel/ui/components/LoadHeatmap';
import PanelCell from '@sentinel/ui/components/PanelCell';
import { GatewayLoadCell } from '@sentinel/contracts/usage/domain';
import { NO_REQUEST } from '@/modules/tower/utils/empty-copy';
import { WEEKDAYS } from '@sentinel/ui/utils/format/weekdays';

const HOUR_DIGITS = 2;

interface LoadCellProps{
    title: string;
    hours: GatewayLoadCell[];
}

const LoadCell = ({ title, hours }: LoadCellProps) => {
    const busiest = hours.reduce((best, cell) => cell.requests > best.requests ? cell : best, hours[0]);
    const isQuiet = busiest.requests === 0;

    return (
        <PanelCell
            title={title}
            figure={isQuiet ? '—' : `${WEEKDAYS[busiest.isoWeekday - 1]} ${String(busiest.hour).padStart(HOUR_DIGITS, '0')}:00`}
            caption='busiest hour, UTC · requests per hour'
        >
            {isQuiet ? <EmptyChart>{NO_REQUEST}</EmptyChart> : <LoadHeatmap cells={hours.map((cell) => ({ ...cell, value: cell.requests }))} unit='req' />}
        </PanelCell>
    );
};

export default LoadCell;
