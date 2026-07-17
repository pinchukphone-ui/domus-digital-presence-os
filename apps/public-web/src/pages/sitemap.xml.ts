import { getMortgageHub } from '@domus/api-client';
import { absoluteUrl } from '@domus/seo';
export const prerender = false;
export async function GET() {
  if (process.env.PREVIEW_MODE === 'true') return new Response('Not found', { status: 404 });
  const hub = await getMortgageHub();
  const origin = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${hub.pages.filter((page) => page.status === 'published').map((page) => `<url><loc>${absoluteUrl(origin, page.canonicalPath)}</loc></url>`).join('')}</urlset>`;
  return new Response(body, { headers: { 'content-type': 'application/xml' } });
}
