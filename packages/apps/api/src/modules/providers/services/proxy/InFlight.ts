import { FastifyReply } from 'fastify';

export const inFlight = { count: 0 };

export const trackInFlight = (reply: FastifyReply) => {
    inFlight.count += 1;
    reply.raw.on('close', () => {
        inFlight.count -= 1;
    });
};
