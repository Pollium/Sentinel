import { ChartBar } from '@sentinel/ui/contracts/chart';
import { GatewayLatency, LATENCY_SPAN_EDGES_MS } from '@sentinel/contracts/usage/domain';
import { count, percent } from '@sentinel/ui/utils/format/format-metrics';
import { sum } from '@sentinel/ui/utils/metrics/period';

const MS_PER_SECOND = 1000;
const ROUNDED_MS = 10;

export const seconds = (ms: number): string => ms < MS_PER_SECOND
    ? `${Math.round(ms / ROUNDED_MS) * ROUNDED_MS} ms`
    : `${(ms / MS_PER_SECOND).toFixed(1)} s`;

const edgeLabel = (ms: number): string => `${ms / MS_PER_SECOND}`;

const SPAN_LABELS = [
    `< ${edgeLabel(LATENCY_SPAN_EDGES_MS[0])} s`,
    ...LATENCY_SPAN_EDGES_MS.slice(1).map((edge, index) => `${edgeLabel(LATENCY_SPAN_EDGES_MS[index])}–${edgeLabel(edge)} s`),
    `${edgeLabel(LATENCY_SPAN_EDGES_MS[LATENCY_SPAN_EDGES_MS.length - 1])} s +`
];

export const latencyColumns = (latency: GatewayLatency): ChartBar[] => {
    const total = sum(latency.spans);

    return latency.spans.map((requests, span) => ({
        key: SPAN_LABELS[span],
        label: SPAN_LABELS[span],
        value: requests,
        display: percent(requests, total),
        note: `${count(requests)} requests`
    }));
};
