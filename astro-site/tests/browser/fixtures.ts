import { test as base, expect, type BrowserContext } from '@playwright/test';

function previewAuthorization(baseURL?: string) {
  const preview = process.env.SWM_PREVIEW_URL;
  if (!preview) return undefined;
  const origin = new URL(preview).origin;
  if (!origin.endsWith('.vercel.app') || new URL(baseURL ?? '').origin !== origin) {
    throw new Error('Preview verification requires the exact approved Vercel deployment origin.');
  }
  const token = process.env.VERCEL_OIDC_TOKEN;
  if (!token) throw new Error('Preview verification requires local Vercel OIDC authentication.');
  return { origin, token };
}

export async function authorizeContext(context: BrowserContext, baseURL?: string) {
  const auth = previewAuthorization(baseURL);
  if (!auth) return;
  // Authentication is attached only to this deployment, never to Google, HubSpot,
  // production or another external origin. Do not record secret-bearing traces.
  await context.route(`${auth.origin}/**`, async route => {
    try {
      const response = await route.fetch({ maxRedirects: 0, headers: { ...route.request().headers(), 'x-vercel-trusted-oidc-idp-token': auth.token } });
      await route.fulfill({ response });
    } catch {
      // Cancellation during teardown is expected. Never surface request headers
      // in reporter errors; a real failed request remains visible to the page.
      await route.abort('failed').catch(() => {});
    }
  });
}

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    await authorizeContext(context, baseURL);
    await use(context);
    await context.unrouteAll({ behavior: 'ignoreErrors' });
  },
  request: async ({ request, baseURL }, use) => {
    const auth = previewAuthorization(baseURL);
    if (!auth) return use(request);
    const scopedRequest = new Proxy(request, {
      get(target, property) {
        if (property === 'get') return async (path: string, options = {}) => {
          if (new URL(path, baseURL).origin !== auth.origin) throw new Error('Refusing to forward preview authentication to another origin.');
          try {
            return await target.get(path, { ...options, maxRedirects: 0, headers: { 'x-vercel-trusted-oidc-idp-token': auth.token } });
          } catch {
            throw new Error(`Protected preview request failed: ${new URL(path, baseURL).pathname}`);
          }
        };
        const value = Reflect.get(target, property);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    await use(scopedRequest);
  },
});
export { expect };
