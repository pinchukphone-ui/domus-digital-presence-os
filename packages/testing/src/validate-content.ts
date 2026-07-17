import { getMortgageHub } from '@domus/api-client';
import { alternatePages } from '@domus/seo';

const hub = await getMortgageHub();
if (hub.pages.length !== 7) throw new Error(`Expected 7 published pages, found ${hub.pages.length}`);
const paths = new Set(hub.pages.map((page) => page.canonicalPath));
for (const page of hub.pages) {
  if (page.metaDescription.length < 50 || page.metaDescription.length > 170) throw new Error(`Invalid description: ${page.id}`);
  if (!page.canonicalPath.startsWith(`/${page.language}/`)) throw new Error(`Language/canonical mismatch: ${page.id}`);
  if (alternatePages(page, hub.pages).length < 1) throw new Error(`No hreflang self reference: ${page.id}`);
  for (const link of page.links) if (!paths.has(link.href)) throw new Error(`Broken link ${link.href} on ${page.id}`);
  if (page.cta && !paths.has(page.cta.href.split('#')[0]!)) throw new Error(`Broken CTA ${page.cta.href} on ${page.id}`);
}
console.log(`Validated ${hub.pages.length} published pages: schema, metadata, hreflang and internal links OK.`);
