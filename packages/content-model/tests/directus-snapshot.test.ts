import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const snapshotPath = fileURLToPath(new URL('../../../apps/directus/snapshots/schema.yaml', import.meta.url));
const metadataPath = fileURLToPath(new URL('../../../infrastructure/database/bootstrap/001_directus_metadata.sql', import.meta.url));
const publishedProjectionPath = fileURLToPath(new URL('../../../infrastructure/database/migrations/002_published_projections.sql', import.meta.url));
const accessScriptPath = fileURLToPath(new URL('../../../infrastructure/database/apply-directus-renderer-access.sh', import.meta.url));
const localComposePath = fileURLToPath(new URL('../../../infrastructure/docker/compose.yml', import.meta.url));
const productionComposePath = fileURLToPath(new URL('../../../infrastructure/deployment/compose.production.yml', import.meta.url));
const previewComposePath = fileURLToPath(new URL('../../../infrastructure/deployment/compose.preview.yml', import.meta.url));
const expectedCollections = [
  'change_tasks',
  'content_blocks',
  'ctas',
  'hubs',
  'internal_links',
  'language_versions',
  'media_assets',
  'pages',
  'published_content_blocks',
  'published_ctas',
  'published_internal_links',
  'published_pages',
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

  it('separates public and preview version permissions', () => {
    const metadata = readFileSync(metadataPath, 'utf8');
    const previewValues = metadata.split('FROM (VALUES')[1]?.split(') AS preview_collections')[0] ?? '';
    const previewCollections = [...previewValues.matchAll(/\('([a-z_]+)'\)/g)].map((match) => match[1]);

    expect(metadata).toContain('DIRECTUS_PUBLIC_TOKEN');
    expect(metadata).toContain('DIRECTUS_PREVIEW_TOKEN');
    expect(metadata).toContain("'cd1a1d45-086a-4d18-a5ae-44d0066e47e4', 'published_pages', 'read', NULL");
    expect(metadata).not.toContain("'cd1a1d45-086a-4d18-a5ae-44d0066e47e4', 'pages', 'read', NULL");
    expect(metadata).not.toContain("'cd1a1d45-086a-4d18-a5ae-44d0066e47e4', 'language_versions'");
    expect(previewCollections).toEqual(['pages', 'content_blocks', 'internal_links', 'ctas', 'language_versions']);
  });

  it('keeps public collections transactionally synchronized with published source rows', () => {
    const migration = readFileSync(publishedProjectionPath, 'utf8');

    expect(migration).toContain('CREATE TABLE published_pages');
    expect(migration).toContain("WHERE page.status = 'published'");
    expect(migration).toContain("WHERE source_page.status = 'published'");
    expect(migration).toContain("AND target_page.status = 'published'");
    for (const collection of ['pages', 'content_blocks', 'ctas', 'internal_links']) {
      expect(migration).toMatch(new RegExp(`AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON ${collection}`));
    }
  });

  it('wires distinct tokens and verifies access after clearing Directus permission cache', () => {
    const localCompose = readFileSync(localComposePath, 'utf8');
    const productionCompose = readFileSync(productionComposePath, 'utf8');
    const previewCompose = readFileSync(previewComposePath, 'utf8');
    const accessScript = readFileSync(accessScriptPath, 'utf8');

    expect(localCompose).toContain('DIRECTUS_STATIC_TOKEN: ${DIRECTUS_PUBLIC_TOKEN}');
    expect(localCompose).toContain('DIRECTUS_STATIC_TOKEN: ${DIRECTUS_PREVIEW_TOKEN}');
    expect(localCompose).toContain('preview-gateway:');
    expect(localCompose).toContain('PREVIEW_AUTH_PASSWORD: ${PREVIEW_AUTH_PASSWORD:-${DIRECTUS_PREVIEW_TOKEN}}');
    expect(localCompose).toContain('ports: ["127.0.0.1:4322:4322"]');
    expect(productionCompose).toContain('DIRECTUS_STATIC_TOKEN: ${DIRECTUS_PUBLIC_TOKEN}');
    expect(previewCompose).toContain('DIRECTUS_STATIC_TOKEN: ${DIRECTUS_PREVIEW_TOKEN}');
    expect(accessScript).toContain('restart directus');
    expect(accessScript).toContain('--no-deps public-web preview preview-gateway');
    expect(accessScript).toContain('public source pages 403, published projection 200, preview source pages 200');
  });
});
