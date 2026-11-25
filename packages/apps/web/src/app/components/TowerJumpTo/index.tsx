import JumpBox from '@sentinel/ui/components/JumpBox';
import { NAV_ENTRIES } from '@/app/navigation/items';

const PAGES = NAV_ENTRIES.map((entry) => ({ id: entry.to, label: entry.label, note: 'Page' }));

const TowerJumpTo = () => <JumpBox label='Jump to a page' destinations={PAGES} />;

export default TowerJumpTo;
