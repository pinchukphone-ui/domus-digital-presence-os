import { HubSchema, LanguageVersionSnapshotSchema, type Hub, type Page } from '@domus/content-model';
import { mortgageHubFixture, mortgageHubFixtureVersions } from './fixture';

type DirectusList<T> = { data: T[] };
type DbPage = {
  id: string; hub_id: string; translation_group: string; language: 'pl' | 'ru'; slug: string;
  status: 'draft' | 'published' | 'archived'; title: string; meta_description: string;
  canonical_path: string; page_type: 'hub' | 'article' | 'service';
};
type DbBlock = { id: string; page_id: string; kind: Page['blocks'][number]['kind']; sort: number; heading: string | null; body: string | null; data: Record<string, unknown> | null };
type DbLink = { source_page_id: string; target_page_id: string; label: string; href: string; relation: 'child' | 'related' | 'service' };
type DbCta = { id: string; page_id: string; label: string; href: string; style: 'primary' | 'secondary' };
type DbLanguageVersion = {
  page_id: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  snapshot: unknown;
};

async function list<T>(base: string, collection: string, token?: string): Promise<T[]> {
  const response = await fetch(`${base}/items/${collection}?limit=-1`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error(`Directus ${collection}: ${response.status} ${response.statusText}`);
  return ((await response.json()) as DirectusList<T>).data;
}

export async function getMortgageHub(options: { includeDrafts?: boolean } = {}): Promise<Hub> {
  if ((process.env.CONTENT_SOURCE ?? 'fixture') === 'fixture') {
    const pathToPage = new Map(mortgageHubFixture.pages.map((page) => [page.canonicalPath, page.id]));
    return renderMortgageHub({
      pages: mortgageHubFixture.pages.map(toDbPage),
      blocks: mortgageHubFixture.pages.flatMap((page) => page.blocks.map((block) => ({ ...block, page_id: page.id }))),
      links: mortgageHubFixture.pages.flatMap((page) => page.links.map((link) => ({
        source_page_id: page.id,
        target_page_id: pathToPage.get(link.href) ?? '',
        ...link
      }))),
      ctas: mortgageHubFixture.pages.flatMap((page) => page.cta ? [{ ...page.cta, page_id: page.id }] : []),
      versions: options.includeDrafts ? mortgageHubFixtureVersions : []
    }, Boolean(options.includeDrafts));
  }
  const base = process.env.DIRECTUS_INTERNAL_URL ?? process.env.DIRECTUS_PUBLIC_URL;
  if (!base) throw new Error('DIRECTUS_INTERNAL_URL or DIRECTUS_PUBLIC_URL is required');
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  const [pages, blocks, links, ctas, versions] = await Promise.all([
    list<DbPage>(base, 'pages', token), list<DbBlock>(base, 'content_blocks', token),
    list<DbLink>(base, 'internal_links', token), list<DbCta>(base, 'ctas', token),
    options.includeDrafts ? list<DbLanguageVersion>(base, 'language_versions', token) : Promise.resolve([])
  ]);
  return renderMortgageHub({ pages, blocks, links, ctas, versions }, Boolean(options.includeDrafts));
}

function renderMortgageHub(
  records: { pages: DbPage[]; blocks: DbBlock[]; links: DbLink[]; ctas: DbCta[]; versions: DbLanguageVersion[] },
  includeDrafts: boolean
): Hub {
  const { pages, blocks, links, ctas, versions } = records;
  const visible = pages.filter((item) => includeDrafts ? item.status !== 'archived' : item.status === 'published');
  const visibleIds = new Set(visible.map((item) => item.id));
  const visiblePaths = new Set(visible.map((item) => item.canonical_path));
  const renderedPages = visible.map((item) => {
    const candidate = latestDraftVersion(item, versions);
    const effective = candidate?.snapshot.page ?? item;
    return {
      id: effective.id, hubId: effective.hub_id, translationGroup: effective.translation_group, language: effective.language,
      slug: effective.slug, status: candidate ? 'draft' : effective.status, title: effective.title, metaDescription: effective.meta_description,
      canonicalPath: effective.canonical_path, pageType: effective.page_type,
      contentVersion: candidate?.version,
      previewCandidate: Boolean(candidate),
      breadcrumbs: buildBreadcrumbs(effective, pages),
      blocks: candidate?.snapshot.blocks ?? blocks.filter((block) => block.page_id === item.id).sort((a, b) => a.sort - b.sort).map((block) => ({ ...block, data: block.data ?? {} })),
      links: links.filter((link) => link.source_page_id === item.id && visibleIds.has(link.target_page_id)).map(({ label, href, relation }) => ({ label, href, relation })),
      cta: ctas.find((cta) => cta.page_id === item.id && visiblePaths.has(cta.href.split('#')[0]!)) ?? null
    };
  });
  return HubSchema.parse({ id: 'mortgage-hub', key: 'mortgage', name: 'DOMUS Mortgage Hub', pages: renderedPages });
}

function toDbPage(page: Page): DbPage {
  return {
    id: page.id,
    hub_id: page.hubId,
    translation_group: page.translationGroup,
    language: page.language,
    slug: page.slug,
    status: page.status,
    title: page.title,
    meta_description: page.metaDescription,
    canonical_path: page.canonicalPath,
    page_type: page.pageType
  };
}

function latestDraftVersion(page: DbPage, versions: DbLanguageVersion[]) {
  const pageVersions = versions.filter((version) => version.page_id === page.id);
  const publishedVersion = Math.max(0, ...pageVersions
    .filter((version) => version.status === 'published')
    .map((version) => version.version));
  const row = versions
    .filter((version) => version.page_id === page.id && version.status === 'draft' && version.version > publishedVersion)
    .sort((left, right) => right.version - left.version)[0];
  if (!row) return null;
  const snapshot = LanguageVersionSnapshotSchema.parse(row.snapshot);
  if (
    snapshot.page.id !== page.id ||
    snapshot.page.hub_id !== page.hub_id ||
    snapshot.page.translation_group !== page.translation_group ||
    snapshot.page.language !== page.language
  ) {
    throw new Error(`Language version ${page.id} v${row.version} has mismatched page identity`);
  }
  return { version: row.version, snapshot };
}

function buildBreadcrumbs(item: DbPage, all: DbPage[]) {
  const home = all.find((candidate) => candidate.language === item.language && candidate.page_type === 'hub');
  if (!home || home.id === item.id) return [{ label: item.title, href: item.canonical_path }];
  const homeLabel = item.language === 'pl' ? 'Kredyty hipoteczne' : 'Ипотека';
  return [{ label: homeLabel, href: home.canonical_path }, { label: item.title, href: item.canonical_path }];
}
