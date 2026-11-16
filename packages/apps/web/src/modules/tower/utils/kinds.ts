import { GatewayKind } from '@sentinel/contracts/providers/domain';

export const KINDS: GatewayKind[] = ['chat', 'voice', 'search'];

export const KIND_LABEL: Record<GatewayKind, string> = {
    chat: 'GenAI',
    voice: 'Voice',
    search: 'Search'
};
