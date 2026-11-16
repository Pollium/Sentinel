import TabBar, { Tab } from '@sentinel/ui/components/layout/TabBar';
import { FOOTER_ENTRIES, NAV_ENTRIES } from '@/app/navigation/items';

const TABS: Tab[] = [...NAV_ENTRIES, ...FOOTER_ENTRIES].map((entry) => ({ icon: entry.icon, label: entry.label, to: entry.to }));

const TowerTabBar = () => <TabBar tabs={TABS} />;

export default TowerTabBar;
