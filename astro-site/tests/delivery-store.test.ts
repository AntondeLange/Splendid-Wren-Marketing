import { afterEach, describe, expect, it, vi } from 'vitest';
import { reserveDelivery } from '../src/lib/contact-delivery';
import { randomUUID } from 'node:crypto';
const env = (key: string) => ({ UPSTASH_REDIS_REST_URL: 'https://redis.example.invalid', UPSTASH_REDIS_REST_TOKEN: 'mock' })[key];
afterEach(() => vi.unstubAllGlobals());
describe('distributed delivery store', () => {
  it('uses atomic reservation, retains a completed result, and detects payload conflicts', async () => {
    const records = new Map<string, string>();
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
      const [cmd, key, value, mode] = JSON.parse(init.body);
      let result: string | null = null;
      if (cmd === 'GET') result = records.get(key) || null;
      if (cmd === 'SET') {
        if (mode === 'NX' && records.has(key)) result = null;
        else { records.set(key, value); result = 'OK'; }
      }
      return new Response(JSON.stringify({ result }));
    }));
    const id = randomUUID(); const first = await reserveDelivery(id, 'payload', env);
    expect(first.previous).toBeUndefined();
    expect((await reserveDelivery(id, 'payload', env)).previous).toBe('pending');
    await first.finish?.('accepted');
    expect((await reserveDelivery(id, 'payload', env)).previous).toBe('accepted');
    expect((await reserveDelivery(id, 'changed', env)).previous).toBe('conflict');
    expect(vi.mocked(fetch).mock.calls[0][1]?.body).toContain('"NX","EX",86400');
    expect([...records.values()].join()).not.toContain('payload');
  });
  it.each([new Response('unavailable', { status: 503 }), new Response(JSON.stringify({ error: 'bad token' })), new Response(JSON.stringify({ result: null }))])('fails closed when the distributed backend cannot reserve safely', async response => {
    vi.stubGlobal('fetch', vi.fn(async () => response.clone()));
    await expect(reserveDelivery(randomUUID(), 'payload', env)).rejects.toThrow();
  });
  it('fails closed on network failure and incomplete backend configuration', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(reserveDelivery(randomUUID(), 'payload', env)).rejects.toThrow();
    await expect(reserveDelivery(randomUUID(), 'payload', key => key === 'UPSTASH_REDIS_REST_URL' ? 'https://redis.example.invalid' : undefined)).rejects.toThrow();
  });
});
