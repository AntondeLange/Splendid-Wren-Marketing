import { test, expect, authorizeContext } from './fixtures';

test('intro can be skipped immediately by keyboard and preserves the homepage URL', async ({ page }) => {
  await page.goto('/?package=Momentum');
  const intro = page.locator('[data-brand-intro]');
  await expect(intro).toBeVisible();
  // Pause the animation to prove dismissal is user controlled, with no timer.
  await intro.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => animation.pause()));
  const skip = page.getByRole('link', { name: 'Skip intro', exact: true });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(intro).not.toBeVisible();
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page).toHaveURL(/\/?\?package=Momentum$/);
  await page.reload();
  await expect(intro).not.toBeVisible();
});

test('direct section links bypass the intro without losing their fragment', async ({ page }) => {
  await page.goto('/?package=Momentum#main-content');
  await expect(page.locator('[data-brand-intro]')).not.toBeVisible();
  await expect(page).toHaveURL(/\?package=Momentum#main-content$/);
});

test('intro closes on animation completion and Escape can bypass it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-brand-intro]')).toBeVisible();
  await expect(page.locator('[data-brand-intro]')).not.toBeVisible({ timeout: 4000 });
  await page.evaluate(() => sessionStorage.removeItem('swm_intro_seen_v1'));
  await page.reload();
  await expect(page.locator('[data-brand-intro]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-brand-intro]')).not.toBeVisible();
  await expect(page.locator('#main-content')).toBeFocused();
});

test('intro fits narrow, landscape and tablet viewports with Skip always visible', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator('[data-brand-intro]');
  await expect(intro).toBeVisible();
  await intro.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 1200; }));
  for (const [width, height] of [[320, 740], [375, 812], [390, 844], [430, 932], [740, 320], [768, 1024], [1024, 768]]) {
    await page.setViewportSize({ width, height });
    const box = await page.getByRole('link', { name: 'Skip intro', exact: true }).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    expect(await intro.evaluate(el => el.scrollWidth <= innerWidth)).toBe(true);
    if (width === 320 || width === 768) await page.screenshot({ path: `test-results/intro-${width}x${height}.png` });
  }
});

test('reduced motion bypasses the intro, including a preference change during playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-brand-intro]')).not.toBeVisible();
  await expect(page.locator('h1')).toContainText('Marketing Solutions');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(page.locator('[data-brand-intro]')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-brand-intro]')).not.toBeVisible();
});

test('without JavaScript the homepage remains usable and no intro blocks it', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  await authorizeContext(context, baseURL);
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('[data-brand-intro]')).not.toBeVisible();
  await expect(page.locator('h1')).toContainText('Marketing Solutions');
  await expect(page.getByRole('link', { name: 'Start my FREE brand audit' }).first()).toBeVisible();
  await context.unrouteAll({ behavior: 'ignoreErrors' });
  await context.close();
});
