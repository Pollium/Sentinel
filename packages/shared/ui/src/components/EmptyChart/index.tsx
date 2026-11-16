import { ReactNode } from 'react';

interface EmptyChartProps{
    children: ReactNode;
}

const EmptyChart = ({ children }: EmptyChartProps) => <p className='text-[0.75rem] text-muted'>{children}</p>;

export default EmptyChart;
