import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const snapshotPath = fileURLToPath(new URL('../../../apps/directus/snapshots/schema.yaml', import.meta.url));
const metadataPath = fileURLToPath(new URL('../../../infrastructure/database/bootstrap/001_directus_metadata.sql', import.meta.url));
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

  it('grants the frontend policy only the five server-side read collections', () => {
    const metadata = readFileSync(metadataPath, 'utf8');
    const permissionValues = metadata.split('FROM (VALUES')[1]?.split(') AS frontend_collections')[0] ?? '';
    const collections = [...permissionValues.matchAll(/\('([a-z_]+)'\)/g)].map((match) => match[1]);

    expect(collections).toEqual(['pages', 'content_blocks', 'internal_links', 'ctas', 'language_versions']);
  });
});
