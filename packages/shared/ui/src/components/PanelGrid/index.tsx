import { ReactNode } from 'react';

interface PanelGridProps{
    children: ReactNode;
}

const PanelGrid = ({ children }: PanelGridProps) => (
    <div className='@container border-y border-line'>
        <div className='grid grid-cols-1 overflow-hidden @2xl:grid-cols-2 @4xl:grid-cols-3'>{children}</div>
    </div>
);

export default PanelGrid;
