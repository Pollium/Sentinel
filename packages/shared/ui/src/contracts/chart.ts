export interface ChartBar{
    key: string;
    label: string;
    value: number;
    display: string;
    note?: string;
}

export interface ChartMeter{
    key: string;
    label: string;
    ratio: number;
    display: string;
    note?: string;
    to?: string;
}

export interface ChartSplitLabels{
    done: string;
    failed: string;
    unit: string;
}

export interface ChartSplit{
    key: string;
    label: string;
    total: number;
    failed: number;
}

export interface ChartPoint{
    date: string;
    value: number;
}

export interface ChartLine{
    key: string;
    label: string;
    points: ChartPoint[];
    tone: 'ink' | 'gray';
    isDashed?: boolean;
}

export interface ChartTipState{
    x: number;
    y: number;
    label: string;
    value: string;
    note?: string;
}

export interface ChartTipContent{
    label: string;
    value: string;
    note?: string;
}

export interface HeadlineMetric{
    key: string;
    label: string;
    value: string;
    delta: string;
    days: number;
    current: ChartPoint[];
    previous: ChartPoint[];
    format: (value: number) => string;
}
