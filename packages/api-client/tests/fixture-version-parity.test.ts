import { afterEach, describe, expect, it, vi } from 'vitest';
import { mortgageHubFixtureVersions } from '../src/fixture';
import { getMortgageHub } from '../src/index';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('fixture version parity', () => {
  it('preserves the immutable v3 and v4 snapshot status history', () => {
    expect(mortgageHubFixtureVersions.map(({ version, status, snapshot }) => ({
      version,
      rowStatus: status,
      snapshotStatus: snapshot.page.status
    }))).toEqual([
      { version: 3, rowStatus: 'published', snapshotStatus: 'draft' },
      { version: 4, rowStatus: 'draft', snapshotStatus: 'published' }
    ]);
  });

  it('renders all eight published pages and keeps service-ru on v3 in public', async () => {
    vi.stubEnv('CONTENT_SOURCE', 'fixture');
    const hub = await getMortgageHub();
    const service = hub.pages.find((page) => page.id === 'service-ru');

    expect(hub.pages).toHaveLength(8);
    expect(service?.status).toBe('published');
    expect(service?.previewCandidate).toBe(false);
    expect(service?.blocks[0]?.body).toContain('Рабочая интеграция требует отдельной задачи');
    expect(service?.blocks[0]?.body).not.toContain('Черновик версии 4:');
  });

  it('overlays only the v4 snapshot in fixture preview', async () => {
    vi.stubEnv('CONTENT_SOURCE', 'fixture');
    const hub = await getMortgageHub({ includeDrafts: true });
    const service = hub.pages.find((page) => page.id === 'service-ru');

    expect(hub.pages).toHaveLength(8);
    expect(service?.status).toBe('draft');
    expect(service?.contentVersion).toBe(4);
    expect(service?.previewCandidate).toBe(true);
    expect(service?.blocks[0]?.body).toContain('Черновик версии 4:');
  });
});
