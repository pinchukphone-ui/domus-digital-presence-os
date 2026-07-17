import { expect, test } from '@playwright/test';

const productionRoutes = [
  '/pl/kredyty-hipoteczne', '/ru/ipoteka',
  '/pl/kredyty-hipoteczne/proces', '/ru/ipoteka/process',
  '/pl/kredyty-hipoteczne/zdolnosc', '/ru/ipoteka/kreditosposobnost',
  '/pl/kredyty-hipoteczne/konsultacja'
];

test('renders the complete published hub with SEO metadata and valid links', async ({ page, request }) => {
  for (const route of productionRoutes) {
    await page.goto(`http://127.0.0.1:4321${route}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^.{50,170}$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await expect(page.locator('link[rel="alternate"][hreflang]')).not.toHaveCount(0);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!.split('#')[0]!));
    for (const href of hrefs) expect((await request.get(`http://127.0.0.1:4321${href}`)).status(), `${route} -> ${href}`).toBeLessThan(400);
  }
});

test('calculator is an interactive React island', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/pl/kredyty-hipoteczne');
  const result = page.locator('[data-testid="mortgage-calculator"] output strong');
  const before = await result.textContent();
  await page.getByLabel('Kwota kredytu (PLN)').fill('700000');
  await expect(result).not.toHaveText(before ?? '');
});

test('preview exposes draft with noindex while production does not', async ({ page, request }) => {
  const draft = '/ru/ipoteka/konsultaciya';
  await page.goto(`http://127.0.0.1:4322${draft}`);
  await expect(page.locator('.preview-banner')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow,noarchive');
  const production = await request.get(`http://127.0.0.1:4321${draft}`, { maxRedirects: 0 });
  expect(production.status()).toBe(302);
});
