import { expect, test } from '@playwright/test';

const productionRoutes = [
  '/pl/kredyty-hipoteczne', '/ru/ipoteka',
  '/pl/kredyty-hipoteczne/proces', '/ru/ipoteka/process',
  '/pl/kredyty-hipoteczne/zdolnosc', '/ru/ipoteka/kreditosposobnost',
  '/pl/kredyty-hipoteczne/konsultacja', '/ru/ipoteka/konsultaciya'
];
const publicOrigin = 'http://127.0.0.1:4421';
const previewOrigin = 'http://127.0.0.1:4422';

test('renders the complete published hub with SEO metadata and valid links', async ({ page, request }) => {
  for (const route of productionRoutes) {
    await page.goto(`${publicOrigin}${route}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^.{50,170}$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await expect(page.locator('link[rel="alternate"][hreflang]')).not.toHaveCount(0);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!.split('#')[0]!));
    for (const href of hrefs) expect((await request.get(`${publicOrigin}${href}`)).status(), `${route} -> ${href}`).toBeLessThan(400);
  }
});

test('calculator is an interactive React island', async ({ page }) => {
  await page.goto(`${publicOrigin}/pl/kredyty-hipoteczne`);
  await expect(page.getByRole('link', { name: 'Oblicz ratę' })).toHaveAttribute('href', '#kalkulator');
  await expect(page.locator('#kalkulator')).toBeVisible();
  const result = page.locator('[data-testid="mortgage-calculator"] output strong');
  const before = await result.textContent();
  await page.getByLabel('Kwota kredytu (PLN)').fill('5000');
  await page.getByLabel('Kwota kredytu (PLN)').blur();
  await expect(page.getByText('Podaj kwotę od 10 000 do 10 000 000 PLN.')).toBeVisible();
  await expect(page.locator('.calculator__cta[aria-disabled="true"]')).toContainText('Omów ten wynik');
  await page.getByLabel('Kwota kredytu (PLN)').fill('700000');
  await expect(result).not.toHaveText(before ?? '');
  await expect(result).toContainText('PLN / mies.');
  const consultationLink = page.getByRole('link', { name: 'Omów ten wynik' });
  await expect(consultationLink).toHaveAttribute('href', '/pl/kredyty-hipoteczne/konsultacja?amount=700000&years=25&rate=7.2#formularz');
  await consultationLink.click();
  await expect(page).toHaveURL(`${publicOrigin}/pl/kredyty-hipoteczne/konsultacja?amount=700000&years=25&rate=7.2#formularz`);
  await expect(page.getByRole('heading', { name: 'Rozmowa o Twojej sytuacji' })).toBeVisible();
  await expect(page.getByTestId('mortgage-context')).toContainText('700 000 PLN · 25 lat · 7,2%');
  await expect(page.getByTestId('mortgage-context')).toContainText('5037 PLN / mies.');
  await expect(page.getByRole('link', { name: 'Русский' })).toHaveAttribute('href', '/ru/ipoteka/konsultaciya?amount=700000&years=25&rate=7.2#forma');

  await page.goto(`${publicOrigin}/ru/ipoteka`);
  await expect(page.getByRole('link', { name: 'Обсудить этот расчёт' })).toHaveAttribute('href', '/ru/ipoteka/konsultaciya?amount=500000&years=25&rate=7.2#forma');
});

test('exposes an accessible localized conversion path', async ({ page }) => {
  await page.goto(`${publicOrigin}/pl/kredyty-hipoteczne`);
  await expect(page.getByRole('link', { name: 'Polski' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toHaveAttribute('href', '#content');
  await expect(page.locator('.breadcrumbs')).toHaveCount(0);

  await page.goto(`${publicOrigin}/ru/ipoteka`);
  await expect(page.getByRole('link', { name: 'Русский' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Рассчитать платёж' })).toHaveAttribute('href', '#kalkulyator');

  await page.goto(`${publicOrigin}/pl/kredyty-hipoteczne/proces`);
  await expect(page.getByRole('link', { name: 'Русский' })).toHaveAttribute('href', '/ru/ipoteka/process');
  await expect(page.locator('.breadcrumbs [aria-current="page"]')).toHaveCount(1);
});

test('consultation demo validates locally without sending data', async ({ page }) => {
  await page.goto(`${publicOrigin}/pl/kredyty-hipoteczne/konsultacja`);
  const form = page.getByTestId('consultation-demo-form');
  await form.getByLabel('E-mail').fill('client@example.com');
  await form.getByRole('button', { name: 'Sprawdź formularz' }).click();
  await expect(form.getByRole('status')).toHaveText('Formularz działa. Dane nie zostały wysłane.');
  await expect(page).toHaveURL(/\/pl\/kredyty-hipoteczne\/konsultacja$/);
});

test('preview overlays the v6 rollback with noindex while production remains on v3', async ({ page, request }) => {
  const consultation = '/ru/ipoteka/konsultaciya';
  const previewResponse = await page.goto(`${previewOrigin}${consultation}`);
  expect(previewResponse?.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive');
  await expect(page.locator('.preview-banner')).toBeVisible();
  await expect(page.locator('.preview-banner')).toContainText('PREVIEW · v6');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow,noarchive');
  await expect(page.getByText(/Черновик версии 4:/)).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Навигационная цепочка' }).getByRole('link', { name: 'Ипотека' })).toHaveAttribute('href', '/ru/ipoteka');
  await expect(page.getByRole('link', { name: 'Русский' })).toHaveAttribute('href', consultation);
  const form = page.getByTestId('consultation-demo-form');
  await form.getByLabel('Эл. почта').fill('client@example.com');
  await form.getByRole('button', { name: 'Проверить форму' }).click();
  await expect(form.getByRole('status')).toHaveText('Форма работает. Данные не были отправлены.');

  const production = await request.get(`${publicOrigin}${consultation}`);
  expect(production.status()).toBe(200);
  const productionBody = await production.text();
  expect(productionBody).toContain('Рабочая интеграция требует отдельной задачи');
  expect(productionBody).not.toContain('Черновик версии 4:');
});

test('preview gateway rejects unauthenticated traffic and marks the raw response noindex', async () => {
  const response = await fetch(`${previewOrigin}/ru/ipoteka/konsultaciya`);
  expect(response.status).toBe(401);
  expect(response.headers.get('www-authenticate')).toContain('Basic realm="DOMUS Preview"');
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow, noarchive');
});

test('publishes one runtime sitemap and exposes no generated sitemap files in preview', async ({ request }) => {
  const publicSitemap = await request.get(`${publicOrigin}/sitemap.xml`);
  expect(publicSitemap.status()).toBe(200);
  expect(publicSitemap.headers()['content-type']).toContain('application/xml');

  const publicBody = await publicSitemap.text();
  for (const route of productionRoutes) expect(publicBody).toContain(`${publicOrigin}${route}`);

  const previewSitemap = await request.get(`${previewOrigin}/sitemap.xml`);
  expect(previewSitemap.status()).toBe(404);
  expect(previewSitemap.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive');

  for (const path of ['/sitemap-index.xml', '/sitemap-0.xml']) {
    const previewResponse = await request.get(`${previewOrigin}${path}`, { maxRedirects: 0 });
    expect(previewResponse.status(), path).toBe(302);
    expect(previewResponse.headers().location, path).toBe('/404');
    expect(previewResponse.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive');
  }
});
