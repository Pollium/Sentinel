import { ReactNode } from 'react';

interface PanelGridProps{
    children: ReactNode;
}

const PanelGrid = ({ children }: PanelGridProps) => (
    <div className='@container'>
        <div className='grid grid-cols-1 gap-x-12 gap-y-12 @2xl:grid-cols-2 @5xl:grid-cols-3'>{children}</div>
    </div>
);

export default PanelGrid;
