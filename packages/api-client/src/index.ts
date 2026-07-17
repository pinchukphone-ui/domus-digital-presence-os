import { HubSchema, type Hub, type Page } from '@domus/content-model';
import { mortgageHubFixture } from './fixture';

type DirectusList<T> = { data: T[] };
type DbPage = {
  id: string; hub_id: string; translation_group: string; language: 'pl' | 'ru'; slug: string;
  status: 'draft' | 'published' | 'archived'; title: string; meta_description: string;
  canonical_path: string; page_type: 'hub' | 'article' | 'service';
};
type DbBlock = { id: string; page_id: string; kind: Page['blocks'][number]['kind']; sort: number; heading: string | null; body: string | null; data: Record<string, unknown> | null };
type DbLink = { source_page_id: string; target_page_id: string; label: string; href: string; relation: 'child' | 'related' | 'service' };
type DbCta = { id: string; page_id: string; label: string; href: string; style: 'primary' | 'secondary' };

async function list<T>(base: string, collection: string, token?: string): Promise<T[]> {
  const response = await fetch(`${base}/items/${collection}?limit=-1`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error(`Directus ${collection}: ${response.status} ${response.statusText}`);
  return ((await response.json()) as DirectusList<T>).data;
}

export async function getMortgageHub(options: { includeDrafts?: boolean } = {}): Promise<Hub> {
  if ((process.env.CONTENT_SOURCE ?? 'fixture') === 'fixture') {
    const visiblePages = mortgageHubFixture.pages.filter((page) => options.includeDrafts ? page.status !== 'archived' : page.status === 'published');
    const visiblePaths = new Set(visiblePages.map((page) => page.canonicalPath));
    return HubSchema.parse({ ...mortgageHubFixture, pages: visiblePages.map((page) => ({
      ...page, links: page.links.filter((link) => visiblePaths.has(link.href)),
      cta: page.cta && visiblePaths.has(page.cta.href.split('#')[0]!) ? page.cta : null
    })) });
  }
  const base = process.env.DIRECTUS_INTERNAL_URL ?? process.env.DIRECTUS_PUBLIC_URL;
  if (!base) throw new Error('DIRECTUS_INTERNAL_URL or DIRECTUS_PUBLIC_URL is required');
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  const [pages, blocks, links, ctas] = await Promise.all([
    list<DbPage>(base, 'pages', token), list<DbBlock>(base, 'content_blocks', token),
    list<DbLink>(base, 'internal_links', token), list<DbCta>(base, 'ctas', token)
  ]);
  const visible = pages.filter((item) => options.includeDrafts ? item.status !== 'archived' : item.status === 'published');
  const visibleIds = new Set(visible.map((item) => item.id));
  const visiblePaths = new Set(visible.map((item) => item.canonical_path));
  return HubSchema.parse({ id: 'mortgage-hub', key: 'mortgage', name: 'DOMUS Mortgage Hub', pages: visible.map((item) => ({
    id: item.id, hubId: item.hub_id, translationGroup: item.translation_group, language: item.language,
    slug: item.slug, status: item.status, title: item.title, metaDescription: item.meta_description,
    canonicalPath: item.canonical_path, pageType: item.page_type,
    breadcrumbs: buildBreadcrumbs(item, pages),
    blocks: blocks.filter((block) => block.page_id === item.id).sort((a, b) => a.sort - b.sort).map((block) => ({ ...block, data: block.data ?? {} })),
    links: links.filter((link) => link.source_page_id === item.id && visibleIds.has(link.target_page_id)).map(({ label, href, relation }) => ({ label, href, relation })),
    cta: ctas.find((cta) => cta.page_id === item.id && visiblePaths.has(cta.href.split('#')[0]!)) ?? null
  })) });
}

function buildBreadcrumbs(item: DbPage, all: DbPage[]) {
  const home = all.find((candidate) => candidate.language === item.language && candidate.page_type === 'hub');
  if (!home || home.id === item.id) return [{ label: item.title, href: item.canonical_path }];
  return [{ label: home.title, href: home.canonical_path }, { label: item.title, href: item.canonical_path }];
}
