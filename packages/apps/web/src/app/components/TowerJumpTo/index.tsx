import JumpBox from '@sentinel/ui/components/JumpBox';
import { FOOTER_ENTRIES, NAV_ENTRIES } from '@/app/navigation/items';

interface TowerJumpToProps{
    className?: string;
}

const PAGES = [...NAV_ENTRIES, ...FOOTER_ENTRIES].map((entry) => ({ id: entry.to, label: entry.label, note: 'Page' }));

const TowerJumpTo = ({ className }: TowerJumpToProps) => (
    <JumpBox label='Jump to a page' className={className} destinations={PAGES} />
);

export default TowerJumpTo;
