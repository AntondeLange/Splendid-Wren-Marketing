import { createHash } from 'node:crypto';

type State = 'pending' | 'accepted' | 'failed' | 'uncertain';
type RecordValue = { fingerprint: string; state: State; expires: number };
const records = new Map<string, RecordValue>();
const TTL = 86400;

// Stores only an opaque submission ID, payload digest and delivery state, never enquiry text.
export async function reserveDelivery(id: string, payload: string, env: (key: string) => string | undefined) {
  const fingerprint = createHash('sha256').update(payload).digest('hex');
  const key = `contact-delivery:${id}`;
  const url = env('UPSTASH_REDIS_REST_URL');
  const token = env('UPSTASH_REDIS_REST_TOKEN');
  const value: RecordValue = { fingerprint, state: 'pending', expires: Date.now() + TTL * 1000 };
  async function command(args: (string | number)[]) {
    const response = await fetch(url!, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) throw new Error('Delivery store unavailable');
    const result = await response.json();
    if (result.error) throw new Error('Delivery store unavailable');
    return result.result;
  }
  let previous: RecordValue | undefined;
  if (url || token) {
    if (!url || !token) throw new Error('Delivery store incomplete');
    const claimed = await command(['SET', key, JSON.stringify(value), 'NX', 'EX', TTL]);
    if (claimed !== 'OK') {
      const raw = await command(['GET', key]);
      // Expiration between SET and GET must never result in an unreserved send.
      if (!raw) throw new Error('Delivery reservation expired');
      previous = JSON.parse(raw);
    }
  } else {
    for (const [entry, record] of records) if (record.expires <= Date.now()) records.delete(entry);
    previous = records.get(key);
    if (!previous) {
      if (records.size >= 10000) throw new Error('Delivery store capacity reached');
      records.set(key, value);
    }
  }
  if (previous) return { previous: previous.fingerprint === fingerprint ? previous.state : 'conflict' as const };
  return {
    previous: undefined,
    async finish(state: State) {
      value.state = state;
      if (url) await command(['SET', key, JSON.stringify(value), 'XX', 'EX', TTL]);
      else records.set(key, value);
    },
  };
}
