import { test, expect } from '@playwright/test';
test('admin requires authentication', async ({ page }) => {
  await page.goto('/admin/guests');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole('heading', { name: 'Todo empieza aquí' }),
  ).toBeVisible();
});
for (const width of [320, 375, 390, 430, 768, 1440])
  test(`public page and login fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/admin/login']) {
      await page.goto(path);
      await expect(page.locator('h1,h2').first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `test-results/login-${width}.png`,
        fullPage: true,
      });
  });
test('RSVP rejects cross-origin requests', async ({ request }) => {
  const response = await request.post('/api/rsvp', {
    headers: { Origin: 'https://untrusted.example' },
    data: { token: 'x' },
  });
  expect(response.status()).toBe(403);
});
