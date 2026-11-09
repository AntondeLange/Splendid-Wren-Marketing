import { test, expect } from './fixtures';
import { readFileSync } from 'node:fs';

async function mockSound(page: import('@playwright/test').Page, blocked = false) {
  await page.addInitScript(({ blocked }) => {
    sessionStorage.setItem('swm_intro_seen_v1', 'true');
    const play = HTMLMediaElement.prototype.play;
    const pause = HTMLMediaElement.prototype.pause;
    let attempts = 0;
    const state = window as unknown as { soundAttempts: number; soundAllowed: boolean };
    state.soundAttempts = 0;
    state.soundAllowed = !blocked;
    HTMLMediaElement.prototype.play = function () {
      if (!this.matches('[data-hero-audio]')) return play.call(this);
      state.soundAttempts = ++attempts;
      if (!state.soundAllowed) return Promise.reject(new DOMException('Gesture required', 'NotAllowedError'));
      Object.defineProperty(this, 'paused', { configurable: true, value: false });
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      if (!this.matches('[data-hero-audio]')) return pause.call(this);
      Object.defineProperty(this, 'paused', { configurable: true, value: true });
      this.dispatchEvent(new Event('pause'));
    };
  }, { blocked });
}

test('sound defaults on, keyboard mute persists and pointer movement cannot restart it', async ({ page }) => {
  await mockSound(page);
  await page.goto('/');
  const button = page.locator('[data-hero-sound-toggle]');
  await expect(button).toHaveText('Sound on');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAttribute('title', 'Turn sound off');
  await expect(button.locator('[data-sound-label]')).toHaveClass('sr-only');
  await expect(button.locator('[data-sound-on-icon]')).toBeVisible();
  await expect(button.locator('[data-sound-off-icon]')).not.toBeVisible();
  await expect(page.locator('[data-hero-audio]')).toHaveJSProperty('loop', true);
  await button.focus(); await page.keyboard.press('Space');
  await expect(button).toHaveText('Sound off');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveAttribute('title', 'Turn sound on');
  await expect(button.locator('[data-sound-on-icon]')).not.toBeVisible();
  await expect(button.locator('[data-sound-off-icon]')).toBeVisible();
  await expect(page.locator('[data-hero-audio]')).toHaveJSProperty('paused', true);
  await page.mouse.click(20, 300); await page.keyboard.press('Tab');
  await expect(page.locator('[data-hero-audio]')).toHaveJSProperty('paused', true);
  await page.reload();
  await expect(button).toHaveText('Sound off');
  expect(await page.evaluate(() => (window as unknown as { soundAttempts: number }).soundAttempts)).toBe(0);
  await button.click(); await expect(button).toHaveText('Sound on');
});

test('blocked autoplay is shown honestly and a visitor gesture enables audio', async ({ page }) => {
  await mockSound(page, true);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const button = page.locator('[data-hero-sound-toggle]');
  await expect(button).toHaveText('Enable sound');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await page.evaluate(() => { (window as unknown as { soundAllowed: boolean }).soundAllowed = true; });
  await page.mouse.click(20, 300);
  await expect(button).toHaveText('Sound on');
  expect(errors).toEqual([]);
});

test('mute in another tab stops playback and reduced motion still exposes the sound control', async ({ page, context }) => {
  await mockSound(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-hero-video]')).toHaveJSProperty('paused', true);
  await expect(page.locator('[data-hero-sound-toggle]')).toHaveText('Sound on');
  const other = await context.newPage();
  await other.goto('/about');
  await other.evaluate(() => localStorage.setItem('swm_hero_sound_v1', 'off'));
  await expect(page.locator('[data-hero-sound-toggle]')).toHaveText('Sound off');
  await expect(page.locator('[data-hero-audio]')).toHaveJSProperty('paused', true);
  await other.close();
});

test('sound control aligns with header content and stays visible from mobile to ultrawide', async ({ page }) => {
  await mockSound(page);
  await page.goto('/');
  for (const [width, height] of [[320, 740], [375, 812], [390, 844], [430, 932], [740, 320], [768, 1024], [1024, 768], [1280, 720], [1440, 900], [1725, 900], [2048, 1152], [2560, 1440], [3440, 1440]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const hero = await page.locator('.hero-section').boundingBox();
    const button = await page.locator('[data-hero-sound-toggle]').boundingBox();
    expect(button).not.toBeNull();
    expect(button!.height).toBeGreaterThanOrEqual(44);
    expect(button!.width).toBe(44);
    expect(button!.x + button!.width).toBeLessThan(hero!.x + hero!.width);
    expect(button!.y + button!.height).toBeLessThan(hero!.y + hero!.height);
    expect(button!.x).toBeGreaterThanOrEqual(0);
    const header = await page.locator('header').first().boundingBox();
    expect(button!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    expect(button!.y).toBeLessThanOrEqual(hero!.y + 24);
    expect(button!.y + button!.height).toBeLessThanOrEqual(height);
    const anchor = width >= 768
      ? page.locator('[data-cta-location="header_desktop"]')
      : page.locator('[data-mobile-nav] summary');
    const anchorBox = await anchor.boundingBox();
    expect(button!.x + button!.width).toBeCloseTo(anchorBox!.x + anchorBox!.width, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('[data-hero-sound-toggle]').evaluate(el => {
      const box = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    })).toBe(true);
    const notice = await page.locator('#analytics-consent-banner').boundingBox();
    if (notice && button!.y < notice.y + notice.height) expect(button!.y + button!.height).toBeLessThanOrEqual(notice.y);
    if (width === 390 || width === 1725 || width === 2560) await page.screenshot({ path: `test-results/hero-sound-${width}.png` });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  // Exercise page scaling as well as viewport resizing: the control must use
  // the header's content boundary rather than the full-width media edge.
  for (const zoom of [0.8, 1.25, 1.5, 2]) {
    await page.evaluate(value => { document.documentElement.style.zoom = String(value); }, zoom);
    const control = await page.locator('[data-hero-sound-toggle]').boundingBox();
    const contact = await page.locator('[data-cta-location="header_desktop"]').boundingBox();
    expect(control!.x + control!.width).toBeCloseTo(contact!.x + contact!.width, 0);
    expect(control!.x + control!.width).toBeLessThanOrEqual(1440);
    expect(control!.y + control!.height).toBeLessThanOrEqual(900);
  }
});

test('the real recording can play and be muted using the button', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('swm_intro_seen_v1', 'true'));
  await page.goto('/');
  const audio = page.locator('[data-hero-audio]');
  const button = page.locator('[data-hero-sound-toggle]');
  // Autoplay policy varies: explicitly enable only if playback is blocked.
  if (await audio.evaluate(el => (el as HTMLAudioElement).paused)) await button.click();
  await expect(button).toHaveText('Sound on');
  await expect.poll(() => audio.evaluate(el => (el as HTMLAudioElement).currentTime)).toBeGreaterThan(0);
  await button.click(); await expect(audio).toHaveJSProperty('paused', true);
  await expect(button).toHaveText('Sound off');
});

test('a returning visitor cannot run the cached legacy audio alongside the sound toggle', async ({ page }) => {
  // Simulate the old response retained under the pre-toggle public URL.
  // The fixture is the actual script from commit 0a6691f, which created its
  // own detached Audio element. New markup must never request this URL.
  const legacy = readFileSync(new URL('../fixtures/legacy-hero-effects.js', import.meta.url), 'utf8');
  let legacyRequests = 0;
  await page.route('**/scripts/hero-effects.js', route => {
    legacyRequests++;
    return route.fulfill({ contentType: 'application/javascript', body: legacy });
  });
  await page.addInitScript(() => {
    sessionStorage.setItem('swm_intro_seen_v1', 'true');
    const Native = window.Audio;
    const state = window as unknown as { detachedHeroAudio: HTMLAudioElement[] };
    state.detachedHeroAudio = [];
    window.Audio = function (src?: string) {
      const audio = new Native(src);
      state.detachedHeroAudio.push(audio);
      return audio;
    } as unknown as typeof Audio;
  });
  await page.goto('/');
  const button = page.locator('[data-hero-sound-toggle]');
  const audio = page.locator('[data-hero-audio]');
  if (await audio.evaluate(el => (el as HTMLAudioElement).paused)) await button.click();
  await expect(button).toHaveText('Sound on');
  await button.click();
  await expect(button).toHaveText('Sound off');
  await page.mouse.click(20, 300);
  await expect(audio).toHaveJSProperty('paused', true);
  expect(legacyRequests).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { detachedHeroAudio: HTMLAudioElement[] }).detachedHeroAudio.length)).toBe(0);
});
