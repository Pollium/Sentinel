import Provider from '@/modules/providers/models/Provider';
import FakeUpstream from '@tests/fake-upstream';
import { SecretCipher } from '@pollium/readable/auth/secrets';
import { config } from '@/shared/config';
import { useApp } from '@tests/harness';
import { CLIENT_SECRET, seedApiKey, seedProvider } from '@tests/seed';
import { waitForUsage } from '@tests/wait-for-usage';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('voice proxy', () => {
    const ctx = useApp();
    const upstream = new FakeUpstream([
        { method: 'POST', path: '/v1/speak' },
        { method: 'POST', path: '/v1/listen' },
        { method: 'GET', path: '/v1/models' }
    ]);
    const cipher = new SecretCipher(config.encryptionKey);

    beforeAll(async () => {
        await upstream.start();
    });

    afterAll(async () => {
        await upstream.stop();
    });

    beforeEach(async () => {
        upstream.reset();
        await seedApiKey();
    });

    const seedVoiceProvider = (overrides: Partial<Provider> = {}) =>
        seedProvider('voice', {
            baseUrl: upstream.baseUrl,
            encryptedApiKey: cipher.encrypt('dg-provider'),
            ...overrides
        });

    const speak = async (payload: unknown) => ctx.app.inject({
        method: 'POST',
        url: '/v1/speak?model=aura-2-helena-en&encoding=mp3',
        headers: { authorization: `Token ${CLIENT_SECRET}`, 'content-type': 'application/json' },
        payload: payload as object
    });

    it('proxies speech through the provider and returns the audio bytes', async () => {
        const provider = await seedVoiceProvider();
        const audio = Buffer.from([0xff, 0xfb, 0x90, 0x00, 0x01]);
        upstream.enqueue({ status: 200, raw: { body: audio, contentType: 'audio/mpeg' } });

        const res = await speak({ text: 'Hello world' });

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('audio/mpeg');
        expect(res.rawPayload.equals(audio)).toBe(true);
        expect(res.headers['x-gateway-provider']).toBe(provider.name);
        expect(upstream.calls).toHaveLength(1);
        expect(upstream.calls[0].headers.authorization).toBe('Token dg-provider');
        expect(upstream.calls[0].url).toBe('/v1/speak?model=aura-2-helena-en&encoding=mp3');
        expect(upstream.calls[0].body).toEqual({ text: 'Hello world' });

        const usage = await waitForUsage(provider.id);
        expect(usage).toMatchObject({ kind: 'voice', model: 'aura-2-helena-en', status: 200 });
    });

    it('proxies transcription with the raw audio body', async () => {
        await seedVoiceProvider();
        const audio = Buffer.from('webm-bytes');
        upstream.enqueue({ status: 200, json: { results: { channels: [{ alternatives: [{ transcript: 'hola' }] }] } } });

        const res = await ctx.app.inject({
            method: 'POST',
            url: '/v1/listen?model=nova-3',
            headers: { authorization: `Token ${CLIENT_SECRET}`, 'content-type': 'audio/webm' },
            payload: audio
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toMatchObject({ results: { channels: [{ alternatives: [{ transcript: 'hola' }] }] } });
        expect(upstream.calls).toHaveLength(1);
        expect(upstream.calls[0].headers['content-type']).toContain('audio/webm');

        const forwarded = upstream.calls[0].body;
        expect(Buffer.isBuffer(forwarded)).toBe(true);
        if(Buffer.isBuffer(forwarded)) expect(forwarded.equals(audio)).toBe(true);
    });

    it('proxies the model catalog', async () => {
        await seedVoiceProvider();
        upstream.enqueue({ status: 200, json: { models: [{ canonical_name: 'aura-2-helena-en' }] } });

        const res = await ctx.app.inject({
            method: 'GET',
            url: '/v1/models',
            headers: { authorization: `Token ${CLIENT_SECRET}` }
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toMatchObject({ models: [{ canonical_name: 'aura-2-helena-en' }] });
        expect(upstream.calls[0].method).toBe('GET');
    });

    it('rejects a request with no api key', async () => {
        const res = await ctx.app.inject({
            method: 'POST',
            url: '/v1/speak?model=aura-2-helena-en',
            headers: { 'content-type': 'application/json' },
            payload: { text: 'hi' }
        });

        expect(res.statusCode).toBe(401);
        expect(res.json()).toEqual({ error: 'ApiKey::Unauthorized' });
        expect(upstream.calls).toHaveLength(0);
    });

    it('fails over to another provider on a server error', async () => {
        await seedVoiceProvider({ name: 'Alpha', encryptedApiKey: cipher.encrypt('dg-a') });
        await seedVoiceProvider({ name: 'Beta', encryptedApiKey: cipher.encrypt('dg-b') });
        const audio = Buffer.from([0x01]);
        upstream.enqueue({ status: 500, json: { error: 'boom' } });
        upstream.enqueue({ status: 200, raw: { body: audio, contentType: 'audio/mpeg' } });

        const res = await speak({ text: 'hi' });

        expect(res.statusCode).toBe(200);
        expect(res.rawPayload.equals(audio)).toBe(true);
        expect(upstream.calls).toHaveLength(2);
        expect(upstream.calls[0].headers.authorization).not.toBe(upstream.calls[1].headers.authorization);
    });

    it('moves to another account when one is out of credits and leaves that one out', async () => {
        await seedVoiceProvider({ name: 'Alpha', encryptedApiKey: cipher.encrypt('dg-a') });
        await seedVoiceProvider({ name: 'Beta', encryptedApiKey: cipher.encrypt('dg-b') });
        const audio = Buffer.from([0x01]);
        upstream.enqueue({ status: 402, json: { err_msg: 'Project does not have enough credits for this request.' } });
        upstream.enqueue({ status: 200, raw: { body: audio, contentType: 'audio/mpeg' } });
        upstream.enqueue({ status: 200, raw: { body: audio, contentType: 'audio/mpeg' } });

        const first = await speak({ text: 'hi' });
        const second = await speak({ text: 'again' });

        expect(first.statusCode).toBe(200);
        expect(second.statusCode).toBe(200);
        expect(upstream.calls).toHaveLength(3);
        const [broke, served, after] = upstream.calls.map((call) => call.headers.authorization);
        expect(served).not.toBe(broke);
        expect(after).toBe(served);
    });

    it('answers 503 when every account is out of credits', async () => {
        await seedVoiceProvider();
        upstream.enqueue({ status: 402, json: { err_msg: 'Project does not have enough credits for this request.' } });

        const res = await speak({ text: 'hi' });

        expect(res.statusCode).toBe(503);
        expect(res.json()).toEqual({ error: 'Pool::NoHealthyProvider' });
    });

    it('answers 503 when no voice provider is active', async () => {
        const res = await speak({ text: 'hi' });

        expect(res.statusCode).toBe(503);
        expect(res.json()).toEqual({ error: 'Pool::NoProvider:voice' });
    });
});
