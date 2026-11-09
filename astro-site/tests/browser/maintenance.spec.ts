import { test, expect, authorizeContext } from './fixtures';

for (const [width, height] of [[320, 740], [375, 812], [390, 844], [430, 932], [740, 320], [768, 1024], [1024, 768]]) {
  test(`layout, menu and form at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
    await expect(page.locator('h1')).toContainText('Marketing Solutions');
    await expect(page.locator('[data-hero-video]')).toHaveJSProperty('paused', true);
    await page.getByRole('button', { name: 'Decline', exact: true }).click();
    await page.waitForLoadState();
    await expect(page.locator('#analytics-consent-banner')).toHaveCount(0);
    if (width < 768) {
      const menu = page.locator('[data-mobile-nav]'); const toggle = menu.locator('summary');
      await toggle.focus(); await page.keyboard.press('Enter');
      await expect(menu).toHaveAttribute('open', '');
      const panel = page.locator('#mobile-nav-panel');
      const dimensions = await panel.evaluate(el => ({ height: el.clientHeight, scroll: el.scrollHeight, bottom: el.getBoundingClientRect().bottom }));
      expect(dimensions.bottom).toBeLessThanOrEqual(height + 1);
      if (height === 320) expect(dimensions.scroll).toBeGreaterThan(dimensions.height);
      await page.keyboard.press('Escape'); await expect(toggle).toBeFocused();
      await expect(menu).not.toHaveAttribute('open');
      await toggle.click(); await page.mouse.click(5, height - 5); await expect(menu).not.toHaveAttribute('open');
    }
    await page.goto('/contact?package=Momentum');
    await expect(page.locator('#package')).toHaveValue('Momentum');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('#message')).toHaveAttribute('maxlength', '2000');
    await page.locator('button[type=submit]').click();
    await expect(page.locator('#name')).toBeFocused(); await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
    await page.locator('#name').fill('Browser test'); await page.locator('#businessName').fill('Test company');
    await page.locator('#email').fill('test@example.invalid'); await page.locator('#message').fill('Too short');
    await page.locator('button[type=submit]').click(); await expect(page.locator('#message')).toBeFocused();
    await page.locator('#message').fill('a'.repeat(2000)); await expect(page.locator('[data-char-count]')).toHaveText('2000/2000');
    await page.screenshot({ path: `test-results/contact-${width}x${height}.png`, fullPage: true });
  });
}

test('branding remains optional and does not redirect after five seconds', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/loader'); await page.waitForTimeout(5200);
  await expect(page).toHaveURL(/\/loader$/); await expect(page.locator('img')).toHaveJSProperty('complete', true);
  await page.getByRole('link', { name: 'Continue to website' }).click(); await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
});

test('native form has a submission ID, selected package, and readable errors', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await authorizeContext(context, baseURL);
  const page = await context.newPage();
  await page.goto('/contact?package=Elevate'); await expect(page.locator('#package')).toHaveValue('Elevate');
  await expect(page.locator('input[name=submissionId]')).toHaveAttribute('value', /^[a-f0-9-]{36}$/);
  await page.locator('#name').fill('Native test'); await page.locator('#businessName').fill('Example');
  await page.locator('#email').fill('test@example.invalid'); await page.locator('#message').fill('Valid enquiry with no email sent.');
  // Honeypot acceptance exercises the real native HTML route without contacting SMTP.
  await page.locator('input[name=website]').evaluate(el => (el as HTMLInputElement).value = 'test');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('h1')).toHaveText('Thank you for your enquiry'); await expect(page.getByRole('link', { name: 'Return to the homepage' })).toBeVisible();
  await context.unrouteAll({ behavior: 'ignoreErrors' });
  await context.close();
});

test('consent gates actual SDK requests, strips queries and stops after withdrawal', async ({ page }, testInfo) => {
  const script = await (await fetch('https://splendidwrenmarketing.com.au/_vercel/insights/script.js')).text();
  const measurements: { url: string; body: string }[] = []; const violations: string[] = [];
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    const userAgent = navigator.userAgent.replace('HeadlessChrome', 'Chrome');
    Object.defineProperty(navigator, 'userAgent', { get: () => userAgent });
    document.addEventListener('securitypolicyviolation', event => console.error('CSP-VIOLATION:' + event.blockedURI));
  });
  page.on('console', message => { if (message.text().startsWith('CSP-VIOLATION:')) violations.push(message.text()); });
  await page.route('**/_vercel/insights/script.js', route => route.fulfill({ contentType: 'application/javascript', body: script }));
  await page.route(/\/_vercel\/insights\/(view|event|session)/, async route => {
    measurements.push({ url: route.request().url(), body: route.request().postData() || '' });
    await route.fulfill({ status: 200, body: '{}' });
  });
  await page.route(/https:\/\/([a-z0-9.-]+\.)?google-analytics.com\//, async route => {
    measurements.push({ url: route.request().url(), body: route.request().postData() || '' }); await route.fulfill({ status: 204 });
  });
  const scripts: string[] = [];
  page.on('request', req => { if (/googletagmanager|_vercel\/insights\/script/.test(req.url())) scripts.push(req.url()); });
  await page.goto('/?email=private@example.invalid&message=secret-sentinel'); await page.waitForTimeout(500);
  expect(scripts).toHaveLength(0); expect(measurements).toHaveLength(0);
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect.poll(() => scripts.length).toBeGreaterThan(0);
  await expect.poll(() => measurements.length, { timeout: 20000 }).toBeGreaterThan(0);
  await page.evaluate(() => window.dispatchEvent(new Event('swm:consent')));
  expect(scripts.filter(url => url.includes('_vercel/insights/script')).length).toBe(1);
  // Exercise the real click handler without navigating to or submitting the external form.
  await page.locator('a[href*="hs-sites"]').first().evaluate(el => el.addEventListener('click', e => e.preventDefault()));
  await page.locator('a[href*="hs-sites"]').first().click();
  await page.waitForTimeout(1200);
  await expect.poll(() => measurements.some(item => item.url.includes('google-analytics.com')), { timeout: 20000 }).toBe(true);
  await expect.poll(() => measurements.some(item => item.url.includes('/_vercel/insights/view')), { timeout: 10000 }).toBe(true);
  const payload = measurements.map(item => item.url + item.body).join('\n');
  expect(payload).not.toMatch(/private|secret-sentinel/); expect(violations).toEqual([]);
  await testInfo.attach('measurement-request-summary', { contentType: 'application/json', body: JSON.stringify(measurements.map(item => ({ provider: item.url.includes('google-analytics.com') ? 'google' : 'vercel', path: new URL(item.url).pathname, hasBody: Boolean(item.body), intercepted: true })), null, 2) });
  const events = await page.evaluate(() => Array.from((window as unknown as { dataLayer: IArguments[] }).dataLayer || []).map(item => Array.from(item)));
  expect(JSON.stringify(events)).toContain('brand_audit_click'); expect(JSON.stringify(events)).not.toContain('brand_audit_complete');
  await page.getByRole('button', { name: 'Analytics preferences', exact: true }).last().click();
  await page.getByRole('button', { name: 'Decline', exact: true }).click(); await page.waitForLoadState();
  measurements.length = 0; scripts.length = 0;
  await page.reload(); await page.waitForTimeout(700);
  expect(scripts).toHaveLength(0); expect(measurements).toHaveLength(0);
});

test('sitemap destinations and local assets resolve with production canonicals', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
  expect(urls.length).toBeGreaterThan(20);
  const assets = new Set<string>();
  for (const url of urls) {
    expect(url.origin).toBe('https://splendidwrenmarketing.com.au');
    const response = await request.get(url.pathname); expect(response.status(), url.pathname).toBe(200);
    const html = await response.text(); expect(html).toContain(`rel="canonical" href="${url.origin}${url.pathname}"`);
    for (const match of html.matchAll(/(?:src|href)="(\/(?:_astro|scripts|media)\/[^"?]+)[^"]*"/g)) assets.add(match[1]);
  }
  const pending = [...assets];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (pending.length) { const asset = pending.pop()!; expect((await request.get(asset)).status(), asset).toBe(200); }
  }));
});

test('JavaScript retries retain IDs after network loss and count only new confirmed acceptances', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as { contactEvents: string[]; SWMAnalytics: unknown };
    state.contactEvents = [];
    state.SWMAnalytics = { hasConsent: () => true, track: (event: string) => state.contactEvents.push(event) };
  });
  const ids: string[] = []; let attempt = 0;
  await page.route('**/api/contact', async route => {
    const body = route.request().postData() || '';
    expect(body).toContain('name="analyticsConsent"\r\n\r\ngranted');
    ids.push(body.match(/name="submissionId"\r\n\r\n([^\r]+)/)?.[1] || '');
    attempt++;
    if (attempt === 1) return route.abort('failed');
    return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, confirmed: attempt < 4, duplicate: attempt === 3, message: 'Enquiry received.' }) });
  });
  await page.goto('/contact?package=Wren%20Lite');
  const fill = async () => {
    await page.locator('#name').fill('Example'); await page.locator('#businessName').fill('Company');
    await page.locator('#email').fill('browser@example.invalid'); await page.locator('#message').fill('A useful browser enquiry.');
  };
  await fill(); await page.locator('button[type=submit]').click();
  await expect(page.locator('[data-form-status]')).toHaveAttribute('role', 'alert');
  await page.locator('button[type=submit]').click(); await expect(page.locator('[data-form-status]')).toHaveText('Enquiry received.');
  expect(ids[0]).toBe(ids[1]);
  for (let i = 0; i < 2; i++) {
    await fill(); await page.locator('button[type=submit]').click(); await expect(page.locator('#name')).toHaveValue('');
  }
  expect(ids[2]).not.toBe(ids[1]);
  const events = await page.evaluate(() => (window as unknown as { contactEvents: string[] }).contactEvents);
  expect(events.filter(event => event === 'generate_lead')).toHaveLength(1);
});

test('storage-disabled visitors can browse and make a session consent choice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
    Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  // Do not send real measurement; this test verifies safe script initialization.
  await page.route(/googletagmanager|\/_vercel\/insights\/script/, route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.goto('/'); await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(page.locator('#analytics-consent-banner')).toHaveCount(0);
  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/); expect(errors).toEqual([]);
});

test('saved denial and withdrawal in another tab prevent measurement after reload', async ({ page, context }) => {
  const scripts: string[] = [];
  await page.route(/googletagmanager|\/_vercel\/insights\/script/, route => {
    scripts.push(route.request().url());
    return route.fulfill({ contentType: 'application/javascript', body: '' });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Decline', exact: true }).click();
  await page.waitForLoadState(); await page.reload();
  expect(scripts).toHaveLength(0);
  await page.getByRole('button', { name: 'Analytics preferences', exact: true }).last().click();
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect.poll(() => scripts.length).toBeGreaterThan(0);
  const other = await context.newPage();
  // Block SDK loading in this auxiliary tab too; no collection can occur.
  await other.route(/googletagmanager|\/_vercel\/insights\/script/, route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await other.goto('/');
  const reloaded = page.waitForEvent('load');
  await other.evaluate(() => localStorage.setItem('swm_analytics_consent_v1', 'denied'));
  await reloaded;
  scripts.length = 0;
  await page.reload(); await page.waitForTimeout(300);
  expect(scripts).toHaveLength(0);
  await other.close();
});

test('native SMTP-unavailable response is readable and offers recovery', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await authorizeContext(context, baseURL);
  const page = await context.newPage();
  await page.goto('/contact?package=Momentum');
  await page.locator('#name').fill('Native test'); await page.locator('#businessName').fill('Example');
  await page.locator('#email').fill('test@example.invalid'); await page.locator('#message').fill('A native enquiry with email disabled.');
  const response = page.waitForResponse(response => response.url().endsWith('/api/contact'));
  await page.locator('button[type=submit]').click();
  expect((await response).status()).toBe(503);
  await expect(page.locator('h1')).toHaveText('Your enquiry needs attention');
  await expect(page.locator('a[href^="mailto:"]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open a new contact form' })).toBeVisible();
  await context.unrouteAll({ behavior: 'ignoreErrors' }); await context.close();
});


test('AMP query URLs serve canonical content without a self redirect', async ({ request }) => {
  const response = await request.get('/about?amp=1');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('rel="canonical" href="https://splendidwrenmarketing.com.au/about"');
});

test('runtime transformation is disabled and contact images use static assets', async ({ request }) => {
  const denied = await request.get('/_image?href=https%3A%2F%2Fexample.invalid%2Funtrusted.avif&w=32&f=webp');
  expect(denied.status()).toBe(404);
  expect((await request.get('/_image')).status()).toBe(404);
  const html = await (await request.get('/contact')).text();
  expect(html).not.toContain('/_image?');
  const sources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  expect(sources.length).toBeGreaterThanOrEqual(3);
  for (const source of [...sources, '/media/contact-background-768.webp', '/media/contact-background-1024.webp']) {
    const image = await request.get(source); expect(image.status()).toBe(200); expect(image.headers()['content-type']).toMatch(/^image\//);
  }
});


test('social metadata uses a full-size brand image separately from the favicon', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('property="og:image" content="https://splendidwrenmarketing.com.au/media/brand-share.png"');
  expect(html).toContain('rel="icon" type="image/png" href="/favicon.png"');
  const response = await request.get('/media/brand-share.png');
  expect(response.status()).toBe(200); expect(response.headers()['content-type']).toContain('image/png');
  const png = await response.body(); expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(630);
});
