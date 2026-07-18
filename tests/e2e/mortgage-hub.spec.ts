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
  await expect(page.getByRole('link', { name: 'Oblicz ratę' })).toHaveAttribute('href', '#kalkulator');
  await expect(page.locator('#kalkulator')).toBeVisible();
  const result = page.locator('[data-testid="mortgage-calculator"] output strong');
  const before = await result.textContent();
  await page.getByLabel('Kwota kredytu (PLN)').fill('700000');
  await expect(result).not.toHaveText(before ?? '');
  await expect(result).toContainText('PLN / mies.');
});

test('exposes an accessible localized conversion path', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/pl/kredyty-hipoteczne');
  await expect(page.getByRole('link', { name: 'Polski' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toHaveAttribute('href', '#content');
  await expect(page.locator('.breadcrumbs')).toHaveCount(0);

  await page.goto('http://127.0.0.1:4321/ru/ipoteka');
  await expect(page.getByRole('link', { name: 'Русский' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Рассчитать платёж' })).toHaveAttribute('href', '#kalkulyator');

  await page.goto('http://127.0.0.1:4321/pl/kredyty-hipoteczne/proces');
  await expect(page.getByRole('link', { name: 'Русский' })).toHaveAttribute('href', '/ru/ipoteka/process');
  await expect(page.locator('.breadcrumbs [aria-current="page"]')).toHaveCount(1);
});

test('consultation demo validates locally without sending data', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/pl/kredyty-hipoteczne/konsultacja');
  const form = page.getByTestId('consultation-demo-form');
  await form.getByLabel('E-mail').fill('client@example.com');
  await form.getByRole('button', { name: 'Sprawdź formularz' }).click();
  await expect(form.getByRole('status')).toHaveText('Formularz działa. Dane nie zostały wysłane.');
  await expect(page).toHaveURL(/\/pl\/kredyty-hipoteczne\/konsultacja$/);
});

test('preview exposes draft with noindex while production does not', async ({ page, request }) => {
  const draft = '/ru/ipoteka/konsultaciya';
  await page.goto(`http://127.0.0.1:4322${draft}`);
  await expect(page.locator('.preview-banner')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow,noarchive');
  await expect(page.getByRole('navigation', { name: 'Навигационная цепочка' }).getByRole('link', { name: 'Ипотека' })).toHaveAttribute('href', '/ru/ipoteka');
  await expect(page.getByRole('link', { name: 'Русский' })).toHaveAttribute('href', draft);
  const form = page.getByTestId('consultation-demo-form');
  await form.getByLabel('Эл. почта').fill('client@example.com');
  await form.getByRole('button', { name: 'Проверить форму' }).click();
  await expect(form.getByRole('status')).toHaveText('Форма работает. Данные не были отправлены.');
  const production = await request.get(`http://127.0.0.1:4321${draft}`, { maxRedirects: 0 });
  expect(production.status()).toBe(302);
});
