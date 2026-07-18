import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const snapshotPath = fileURLToPath(new URL('../../../apps/directus/snapshots/schema.yaml', import.meta.url));
const expectedCollections = [
  'change_tasks',
  'content_blocks',
  'ctas',
  'hubs',
  'internal_links',
  'language_versions',
  'media_assets',
  'pages',
  'services'
];

describe('Directus schema snapshot', () => {
  const snapshot = readFileSync(snapshotPath, 'utf8');

  it('tracks the complete content model for Directus 12', () => {
    expect(snapshot).toContain('directus: 12.1.1');
    expect(snapshot).toContain('vendor: postgres');
    const collectionSection = snapshot.split('\nfields:', 1)[0] ?? '';
    const collections = [...collectionSection.matchAll(/^ {2}- collection: ([a-z_]+)$/gm)].map((match) => match[1]);
    expect(collections).toEqual(expectedCollections);
  });

  it('does not contain credentials or service-user data', () => {
    expect(snapshot).not.toMatch(/password|secret|frontend-service@|admin@example|change-me/i);
  });
});
