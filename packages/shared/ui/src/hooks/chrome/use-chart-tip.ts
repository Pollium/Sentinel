import { ChartTipContent, ChartTipState } from '../../contracts/chart';
import { MouseEvent, useState } from 'react';

const TIP_HALF_WIDTH = 72;

export const useChartTip = () => {
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const [tip, setTip] = useState<ChartTipState | null>(null);

    const show = (event: MouseEvent<HTMLElement>, content: ChartTipContent) => {
        if(root === null) return;

        const box = event.currentTarget.getBoundingClientRect();
        const frame = root.getBoundingClientRect();
        const center = box.left - frame.left + box.width / 2;

        setTip({ ...content, x: Math.min(Math.max(center, TIP_HALF_WIDTH), frame.width - TIP_HALF_WIDTH), y: box.top - frame.top });
    };

    return { setRoot, tip, show, hide: () => setTip(null) };
};
