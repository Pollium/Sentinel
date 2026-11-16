import ConnectionsRegistry from '../lib/gateway/ConnectionRegistry';
import { Recipient } from '../lib/contracts/gateway';
import { describe, expect, it } from 'vitest';

interface Listener{
    socket: Recipient;
    received: () => string[];
}

const listener = (): Listener => {
    const sent: string[] = [];

    return {
        socket: { send: (raw) => sent.push(raw) },
        received: () => sent.map((raw) => (JSON.parse(raw) as { type: string }).type)
    };
};

const frame = (type: string) => ({ type, data: null });

describe('ConnectionsRegistry', () => {
    it('drops a closed socket from every room it joined and from broadcasts', () => {
        const registry = new ConnectionsRegistry();
        const closed = listener();
        const open = listener();

        registry.add(closed.socket);
        registry.add(open.socket);
        registry.join(closed.socket, 'tower:overview:30d');
        registry.join(closed.socket, 'tower:overview:7d');
        registry.join(open.socket, 'tower:overview:30d');

        registry.remove(closed.socket);
        registry.sendToRoom('tower:overview:30d', frame('after.close'));
        registry.sendToRoom('tower:overview:7d', frame('after.close'));
        registry.broadcast(frame('everyone'));

        expect(closed.received()).toEqual([]);
        expect(open.received()).toEqual(['after.close', 'everyone']);
    });

    it('keeps the other rooms of a socket that leaves one', () => {
        const registry = new ConnectionsRegistry();
        const member = listener();

        registry.add(member.socket);
        registry.join(member.socket, 'tower:overview:30d');
        registry.join(member.socket, 'tower:overview:7d');

        registry.leave(member.socket, 'tower:overview:30d');
        registry.sendToRoom('tower:overview:30d', frame('month.only'));
        registry.sendToRoom('tower:overview:7d', frame('week.only'));

        expect(member.received()).toEqual(['week.only']);
    });

    it('forgets a room once its last member is gone', () => {
        const registry = new ConnectionsRegistry();
        const member = listener();

        registry.add(member.socket);
        registry.join(member.socket, 'tower:overview:7d');
        expect(registry.has('tower:overview:7d')).toBe(true);

        registry.remove(member.socket);

        expect(registry.has('tower:overview:7d')).toBe(false);
    });
});
