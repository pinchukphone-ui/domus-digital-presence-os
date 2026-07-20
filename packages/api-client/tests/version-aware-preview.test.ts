import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMortgageHub } from '../src/index';

const page = {
  id: 'service-ru',
  hub_id: 'mortgage-hub',
  translation_group: '55555555-5555-4555-8555-555555555555',
  language: 'ru',
  slug: 'konsultaciya',
  status: 'published',
  title: 'Ипотечная консультация в Польше',
  meta_description: 'Пошаговая подготовка к ипотечной консультации для иностранцев, покупающих недвижимость в Польше.',
  canonical_path: '/ru/ipoteka/konsultaciya',
  page_type: 'service'
} as const;

const publishedBlock = {
  id: 'service-body-ru',
  page_id: page.id,
  kind: 'service',
  sort: 10,
  heading: 'Запросить консультацию',
  body: 'Опубликованный текст версии 3.',
  data: {}
};

const draftVersion = {
  page_id: page.id,
  version: 4,
  status: 'draft',
  snapshot: {
    schema_version: 1,
    page,
    blocks: [{ ...publishedBlock, body: 'Черновой текст версии 4.' }]
  }
};

function mockDirectus(versions: unknown[] = [draftVersion]) {
  const collections: Record<string, unknown[]> = {
    pages: [page],
    published_pages: [page],
    content_blocks: [publishedBlock],
    published_content_blocks: [publishedBlock],
    internal_links: [],
    published_internal_links: [],
    ctas: [],
    published_ctas: [],
    media_assets: [{
      id: '55555555-5555-4555-8555-555555555555', directus_file_id: null,
      alt_pl: 'Znak słowny DOMUS GLOBAL', alt_ru: 'Текстовый логотип DOMUS GLOBAL',
      rights_source: 'DOMUS-owned wordmark; local pilot metadata'
    }],
    language_versions: versions
  };
  return vi.fn(async (input: string | URL | Request) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input : input.url);
    const collection = url.pathname.split('/').at(-1)!;
    return new Response(JSON.stringify({ data: collections[collection] ?? [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('version-aware Directus preview', () => {
  it('keeps public rendering on the published row and never requests draft versions', async () => {
    const fetchMock = mockDirectus();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('CONTENT_SOURCE', 'directus');
    vi.stubEnv('DIRECTUS_INTERNAL_URL', 'http://directus.test');

    const hub = await getMortgageHub();
    const rendered = hub.pages[0]!;

    expect(rendered.status).toBe('published');
    expect(rendered.blocks[0]?.body).toBe('Опубликованный текст версии 3.');
    expect(rendered.previewCandidate).toBe(false);
    expect(hub.mediaAssets).toHaveLength(1);
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toContain(
      'http://directus.test/items/published_pages?limit=-1'
    );
    expect(fetchMock.mock.calls.map(([input]) => String(input))).not.toContain(
      'http://directus.test/items/pages?limit=-1'
    );
    expect(fetchMock.mock.calls.map(([input]) => String(input))).not.toContain(
      'http://directus.test/items/language_versions?limit=-1'
    );
  });

  it('overlays the latest complete draft snapshot only in preview', async () => {
    const olderDraft = { ...draftVersion, version: 2, snapshot: { ...draftVersion.snapshot, blocks: [{ ...publishedBlock, body: 'Старый черновик.' }] } };
    const publishedVersion = { ...draftVersion, version: 3, status: 'published' };
    vi.stubGlobal('fetch', mockDirectus([olderDraft, publishedVersion, draftVersion]));
    vi.stubEnv('CONTENT_SOURCE', 'directus');
    vi.stubEnv('DIRECTUS_INTERNAL_URL', 'http://directus.test');

    const hub = await getMortgageHub({ includeDrafts: true });
    const rendered = hub.pages[0]!;

    expect(rendered.status).toBe('draft');
    expect(rendered.contentVersion).toBe(4);
    expect(rendered.previewCandidate).toBe(true);
    expect(rendered.blocks[0]?.body).toBe('Черновой текст версии 4.');
  });

  it('does not expose an older draft rollback after a newer version is published', async () => {
    const rollback = { ...draftVersion, version: 2, snapshot: { ...draftVersion.snapshot, blocks: [{ ...publishedBlock, body: 'Rollback версии 2.' }] } };
    const publishedVersion = { ...draftVersion, version: 3, status: 'published' };
    vi.stubGlobal('fetch', mockDirectus([rollback, publishedVersion]));
    vi.stubEnv('CONTENT_SOURCE', 'directus');
    vi.stubEnv('DIRECTUS_INTERNAL_URL', 'http://directus.test');

    const hub = await getMortgageHub({ includeDrafts: true });
    const rendered = hub.pages[0]!;

    expect(rendered.status).toBe('published');
    expect(rendered.previewCandidate).toBe(false);
    expect(rendered.blocks[0]?.body).toBe('Опубликованный текст версии 3.');
  });

  it('fails closed when the latest draft is not a complete snapshot', async () => {
    vi.stubGlobal('fetch', mockDirectus([{ ...draftVersion, snapshot: { schema_version: 1 } }]));
    vi.stubEnv('CONTENT_SOURCE', 'directus');
    vi.stubEnv('DIRECTUS_INTERNAL_URL', 'http://directus.test');

    await expect(getMortgageHub({ includeDrafts: true })).rejects.toThrow();
  });
});
