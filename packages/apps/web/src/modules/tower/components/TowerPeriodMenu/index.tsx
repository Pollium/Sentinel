import PeriodMenu from '@sentinel/ui/components/PeriodMenu';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { windowLabel, WINDOWS } from '@/modules/tower/utils/windows';

const TowerPeriodMenu = () => {
    const [window, setWindow] = usePeriod();

    return <PeriodMenu value={window} periods={WINDOWS} labelOf={windowLabel} onChange={setWindow} />;
};

export default TowerPeriodMenu;
