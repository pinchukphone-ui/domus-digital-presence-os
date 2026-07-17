import { describe, expect, it } from 'vitest';
import { HubSchema } from '../src/index';
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
});
