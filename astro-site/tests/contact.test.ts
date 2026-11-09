import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
const mocks = vi.hoisted(() => ({ send: vi.fn(), transport: vi.fn() }));
vi.mock('nodemailer', () => ({ default: { createTransport: mocks.transport } }));
let POST: typeof import('../src/pages/api/contact').POST;
let ip = 0;
const valid = () => ({ name: 'Test', businessName: 'Example', email: 'test@example.invalid', phone: '+61 400 000 000', serviceFocus: 'brand-strategy', package: 'Momentum', message: 'A useful enquiry.', submissionId: randomUUID(), analyticsConsent: 'denied' });
async function send(fields: Record<string, string> = valid(), options: { headers?: Record<string, string>; body?: BodyInit; url?: string } = {}) {
  const request = new Request(options.url || 'https://example.test/api/contact', {
    method: 'POST', body: options.body ?? new URLSearchParams(fields), headers: {
      origin: 'https://example.test', accept: 'application/json', 'x-vercel-forwarded-for': `192.0.2.${++ip}`, ...options.headers,
    },
  });
  return POST({ request } as Parameters<typeof POST>[0]);
}
beforeEach(async () => {
  vi.resetModules(); vi.unstubAllEnvs();
  vi.stubEnv('SMTP_USER', 'mock'); vi.stubEnv('SMTP_PASS', 'mock');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', ''); vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  vi.stubEnv('GA4_MEASUREMENT_ID', 'G-TEST'); vi.stubEnv('GA4_API_SECRET', 'mock');
  mocks.send.mockReset().mockResolvedValue({ accepted: ['recipient@example.invalid'] });
  mocks.transport.mockReset().mockReturnValue({ sendMail: mocks.send });
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected network call')));
  vi.spyOn(console, 'info').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {});
  ({ POST } = await import('../src/pages/api/contact'));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('contact validation and negotiation', () => {
  it.each([10, 2000])('accepts message boundary %i and preserves fields and Reply-To', async (length) => {
    const response = await send({ ...valid(), message: 'a'.repeat(length) });
    expect(response.status).toBe(202); expect(await response.json()).toMatchObject({ confirmed: true });
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ replyTo: 'test@example.invalid', text: expect.stringContaining('Package: Momentum') }));
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([0, 9, 2001])('rejects message boundary %i', async (length) => {
    expect((await send({ ...valid(), message: 'a'.repeat(length) })).status).toBe(400); expect(mocks.send).not.toHaveBeenCalled();
  });
  it('uses browser UTF-16 limits for non-ASCII messages', async () => {
    expect((await send({ ...valid(), message: '🪶'.repeat(1000) })).status).toBe(202);
    expect((await send({ ...valid(), message: '🪶'.repeat(1000) + 'a' })).status).toBe(400);
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  it.each([{ name: '' }, { name: 'a'.repeat(81) }, { businessName: 'a'.repeat(121) }, { email: 'bad' }, { phone: 'invalid' }, { serviceFocus: 'bad' }, { package: 'bad' }, { submissionId: 'bad' }])('rejects invalid fields %j', async (change) => {
    expect((await send({ ...valid(), ...change })).status).toBe(400); expect(mocks.send).not.toHaveBeenCalled();
  });
  it('silently accepts honeypot without mail or conversion', async () => {
    const response = await send({ ...valid(), website: 'spam' } as ReturnType<typeof valid>);
    expect(response.status).toBe(202); expect(await response.json()).toMatchObject({ confirmed: false }); expect(mocks.send).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['https://evil.test', 'http://example.test', 'https://example.test.evil.test'])('rejects origin %s', async (origin) => {
    expect((await send(valid(), { headers: { origin } })).status).toBe(403); expect(mocks.send).not.toHaveBeenCalled();
  });
  it('rejects unsupported, duplicate and file fields', async () => {
    expect((await send({ ...valid(), unknown: 'field' } as ReturnType<typeof valid>)).status).toBe(400);
    const body = new URLSearchParams(valid()); body.append('name', 'duplicate');
    expect((await send(valid(), { body })).status).toBe(400);
    const form = new FormData(); form.append('name', new Blob(['file']), 'file.txt');
    expect((await send(valid(), { body: form })).status).toBe(415);
  });
  it('bounds advertised and actual request sizes', async () => {
    expect((await send(valid(), { headers: { 'content-length': '32001' } })).status).toBe(413);
    expect((await send(valid(), { headers: { 'content-length': 'invalid' } })).status).toBe(400);
    expect((await send(valid(), { body: 'a'.repeat(32001), headers: { 'content-type': 'application/x-www-form-urlencoded' } })).status).toBe(413);
  });
  it('handles malformed multipart and unsupported body types', async () => {
    expect((await send(valid(), { body: 'bad', headers: { 'content-type': 'multipart/form-data; boundary=x' } })).status).toBe(400);
    expect((await send(valid(), { body: '{}', headers: { 'content-type': 'application/json' } })).status).toBe(415);
  });
  it('limits repeated requests and supplies Retry-After', async () => {
    for (let i = 0; i < 6; i++) expect((await send(valid(), { headers: { 'x-vercel-forwarded-for': '192.0.2.100' } })).status).toBe(202);
    const response = await send(valid(), { headers: { 'x-vercel-forwarded-for': '192.0.2.100' } });
    expect(response.status).toBe(429); expect(response.headers.get('retry-after')).toBe('60');
  });
  it('uses distributed counters and retains local fallback when Redis fails', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.invalid');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'mock');
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([{ result: 7 }, { result: 1 }])));
    expect((await send()).status).toBe(429); expect(mocks.send).not.toHaveBeenCalled();
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    // Rate limiting degrades locally, while delivery reservation fails closed.
    expect((await send()).status).toBe(503); expect(mocks.send).not.toHaveBeenCalled();
  });
  it('opens a new rate-limit window after a minute', async () => {
    const now = Date.now(); vi.spyOn(Date, 'now').mockReturnValue(now);
    for (let i = 0; i < 6; i++) await send({ ...valid(), website: 'bot' }, { headers: { 'x-vercel-forwarded-for': '192.0.2.101' } });
    expect((await send(valid(), { headers: { 'x-vercel-forwarded-for': '192.0.2.101' } })).status).toBe(429);
    vi.mocked(Date.now).mockReturnValue(now + 61000);
    expect((await send({ ...valid(), website: 'bot' }, { headers: { 'x-vercel-forwarded-for': '192.0.2.101' } })).status).toBe(202);
  });
  it('returns usable uncached HTML success and validation errors', async () => {
    for (const fields of [valid(), { ...valid(), email: '<invalid>' }]) {
      const response = await send(fields, { headers: { accept: 'text/html' } });
      expect(response.headers.get('content-type')).toContain('text/html'); expect(response.headers.get('cache-control')).toBe('no-store');
      const html = await response.text(); expect(html).toContain('Return to the homepage'); expect(html).not.toContain('<invalid>');
      expect(response.status).toBe(fields.email === '<invalid>' ? 400 : 202);
    }
  });
});
describe('SMTP retries and deduplication', () => {
  it('replays acceptance without sending twice or counting another conversion', async () => {
    const fields = valid(); await send(fields);
    expect(await (await send(fields)).json()).toMatchObject({ confirmed: true, duplicate: true });
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect((await send({ ...fields, message: 'A changed enquiry.' })).status).toBe(409);
  });
  it('blocks concurrent sends while SMTP is pending', async () => {
    let finish!: (value: unknown) => void;
    mocks.send.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const fields = valid(); const first = send(fields);
    await vi.waitFor(() => expect(mocks.send).toHaveBeenCalledTimes(1));
    expect((await send(fields)).status).toBe(409);
    finish({ accepted: ['recipient@example.invalid'] }); await first;
  });
  it('retries a connection failure before SMTP submission', async () => {
    mocks.send.mockRejectedValueOnce({ code: 'ECONNREFUSED', command: 'CONN' });
    expect((await send()).status).toBe(202); expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(mocks.send.mock.calls[0][0].messageId).toBe(mocks.send.mock.calls[1][0].messageId);
  });
  it.each([{ code: 'ETIMEDOUT', command: 'DATA' }, { code: 'ESOCKET' }, { code: 'EAUTH', command: 'AUTH' }])('does not retry ambiguous delivery or auth failure %j', async error => {
    mocks.send.mockRejectedValue(error); const fields = valid();
    expect((await send(fields)).status).toBe(502); expect((await send(fields)).status).toBe(409); expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  it('does not mark recipient rejection as a confirmed completion', async () => {
    mocks.send.mockResolvedValue({ accepted: [], rejected: ['recipient@example.invalid'] });
    expect((await send()).status).toBe(502);
  });
  it('reports missing SMTP configuration', async () => {
    vi.stubEnv('SMTP_USER', ''); expect((await send()).status).toBe(503); expect(mocks.send).not.toHaveBeenCalled();
  });
  it('honors an empty runtime credential over a populated build-time value', async () => {
    // stubEnv populates import.meta.env; changing process.env alone models a
    // deployment runtime override of an already-built server module.
    vi.stubEnv('SMTP_USER', 'build-time-test-user');
    process.env.SMTP_USER = '';
    expect((await send()).status).toBe(503);
    expect(mocks.transport).not.toHaveBeenCalled();
  });
  it.each(['application/json', 'text/html'])('reports ambiguous SMTP failure safely as %s', async accept => {
    mocks.send.mockRejectedValue({ code: 'ETIMEDOUT', command: 'DATA' });
    const response = await send(valid(), { headers: { accept } });
    expect(response.status).toBe(502);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.text();
    expect(body).toContain('Email delivery could not be confirmed');
    expect(body).toContain('before sending again');
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
    if (accept === 'text/html') {
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(body).toContain('mailto:');
    } else expect(JSON.parse(body).retrySafe).toBe(false);
  });
  it('does not repeat SMTP after acceptance when persisting the receipt fails', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.invalid');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'mock');
    let pending: string | null = null;
    vi.mocked(fetch).mockImplementation(async (_url, init) => {
      const command = JSON.parse(String(init?.body));
      if (Array.isArray(command[0])) return new Response(JSON.stringify([{ result: 1 }, { result: 1 }]));
      const [operation, , value, mode] = command;
      if (operation === 'GET') return new Response(JSON.stringify({ result: pending }));
      if (mode === 'XX') throw new Error('Status persistence unavailable');
      if (pending) return new Response(JSON.stringify({ result: null }));
      pending = value;
      return new Response(JSON.stringify({ result: 'OK' }));
    });
    const fields = valid();
    expect((await send(fields)).status).toBe(202);
    expect((await send(fields)).status).toBe(409);
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  it('requires explicit consent for server analytics and sends no contact values', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));
    await send({ ...valid(), analyticsConsent: 'granted' });
    expect(fetch).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(payload.events[0].name).toBe('lead_accepted_server');
    expect(JSON.stringify(payload)).not.toMatch(/test@example|Example|useful enquiry/);
  });
});
