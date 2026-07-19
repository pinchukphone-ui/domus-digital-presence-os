import { describe, expect, it } from 'vitest';
import { mortgageHubFixture } from '@domus/api-client/fixture';
import { alternatePages } from '../src/index';

describe('hreflang', () => {
  it('pairs published translations', () => {
    const page = mortgageHubFixture.pages.find((item) => item.id === 'home-pl')!;
    expect(alternatePages(page, mortgageHubFixture.pages).map((item) => item.language).sort()).toEqual(['pl', 'ru']);
  });

  it('pairs the published service translations', () => {
    const page = mortgageHubFixture.pages.find((item) => item.id === 'service-pl')!;
    expect(alternatePages(page, mortgageHubFixture.pages).map((item) => item.language).sort()).toEqual(['pl', 'ru']);
  });
});
