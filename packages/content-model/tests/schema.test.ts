import { describe, expect, it } from 'vitest';
import { HubSchema, LanguageVersionSnapshotSchema } from '../src/index';
import { mortgageHubFixture } from '../../api-client/src/fixture';

describe('content schema', () => {
  it('accepts the bilingual mortgage fixture', () => {
    expect(HubSchema.parse(mortgageHubFixture).pages).toHaveLength(8);
  });

  it('keeps one pl and one ru page in every translation group', () => {
    const pages = HubSchema.parse(mortgageHubFixture).pages;
    const groups = new Map<string, typeof pages>();
    for (const page of pages) groups.set(page.translationGroup, [...(groups.get(page.translationGroup) ?? []), page]);
    expect(groups.size).toBe(4);
    for (const group of groups.values()) {
      expect(group.map((page) => page.language).sort()).toEqual(['pl', 'ru']);
    }
  });

  it('requires a complete immutable language-version snapshot', () => {
    const page = HubSchema.parse(mortgageHubFixture).pages[0]!;
    const snapshot = LanguageVersionSnapshotSchema.parse({
      schema_version: 1,
      page: {
        id: page.id,
        hub_id: page.hubId,
        translation_group: page.translationGroup,
        language: page.language,
        slug: page.slug,
        canonical_path: page.canonicalPath,
        page_type: page.pageType,
        status: page.status,
        title: page.title,
        meta_description: page.metaDescription
      },
      blocks: page.blocks
    });

    expect(snapshot.page.id).toBe(page.id);
    expect(snapshot.blocks).toHaveLength(page.blocks.length);
  });
});
