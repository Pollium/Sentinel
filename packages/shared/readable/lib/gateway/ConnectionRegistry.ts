import { OutboundMessage, Recipient } from '../contracts/gateway';

export default class ConnectionsRegistry{
    #sockets = new Set<Recipient>();
    #rooms = new Map<string, Set<Recipient>>();
    #memberships = new WeakMap<Recipient, Set<string>>();

    add(socket: Recipient){
        this.#sockets.add(socket);
    }

    remove(socket: Recipient){
        this.leaveAll(socket);
        this.#sockets.delete(socket);
    }

    join(socket: Recipient, room: string){
        let members = this.#rooms.get(room);
        if(!members){
            members = new Set();
            this.#rooms.set(room, members);
        }

        members.add(socket);

        const memberships = this.#memberships.get(socket) ?? new Set<string>();
        memberships.add(room);
        this.#memberships.set(socket, memberships);
    }

    leave(socket: Recipient, room: string){
        const members = this.#rooms.get(room);
        members?.delete(socket);
        if(members?.size === 0) this.#rooms.delete(room);

        this.#memberships.get(socket)?.delete(room);
    }

    leaveAll(socket: Recipient){
        for(const room of this.#memberships.get(socket) ?? []) this.leave(socket, room);

        this.#memberships.delete(socket);
    }

    has(room: string): boolean{
        return this.#rooms.has(room);
    }

    broadcast(message: OutboundMessage<unknown>){
        this.#send(this.#sockets, message);
    }

    sendToRoom(room: string, message: OutboundMessage<unknown>){
        const members = this.#rooms.get(room);
        if(members) this.#send(members, message);
    }

    #send(sockets: Iterable<Recipient>, message: OutboundMessage<unknown>){
        const raw = JSON.stringify(message);
        for(const socket of sockets) socket.send(raw);
    }
}
