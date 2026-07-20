import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const productionRoutes = [
  '/pl/kredyty-hipoteczne', '/ru/ipoteka',
  '/pl/kredyty-hipoteczne/proces', '/ru/ipoteka/process',
  '/pl/kredyty-hipoteczne/zdolnosc', '/ru/ipoteka/kreditosposobnost',
  '/pl/kredyty-hipoteczne/konsultacja', '/ru/ipoteka/konsultaciya'
];

const mobileRoutes = [
  '/pl/kredyty-hipoteczne', '/ru/ipoteka',
  '/pl/kredyty-hipoteczne/konsultacja', '/ru/ipoteka/konsultaciya'
];

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const publicOrigin = 'http://127.0.0.1:4421';

for (const route of productionRoutes) {
  test(`has no automatically detectable WCAG A/AA violations: ${route}`, async ({ page }) => {
    await page.goto(`${publicOrigin}${route}`);
    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const route of mobileRoutes) {
  test(`reflows without automatically detectable WCAG A/AA violations: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${publicOrigin}${route}`);
    await expect(page.locator('html')).toHaveJSProperty('scrollWidth', 390);
    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('exposes the skip link first and keeps a visible keyboard focus indicator', async ({ page }) => {
  await page.goto(`${publicOrigin}/pl/kredyty-hipoteczne`);
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Przejdź do treści' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toHaveCSS('outline-style', 'solid');
  await expect(skipLink).toHaveCSS('outline-width', '3px');
});
