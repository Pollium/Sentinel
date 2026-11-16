import { ScrollShadow } from '@heroui/react';
import { ReactNode } from 'react';

interface PanelScrollProps{
    onScroll?: () => void;
    children: ReactNode;
}

const PanelScroll = ({ onScroll, children }: PanelScrollProps) => (
    <ScrollShadow hideScrollBar onScroll={onScroll} className='-m-1.5 max-h-84 p-1.5'>{children}</ScrollShadow>
);

export default PanelScroll;
