import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { mortgageHubFixture } from '../src/fixture';

const manifestPath = fileURLToPath(new URL('../../../docs/operations/change-manifests/service-ru-v3.json', import.meta.url));
const publicationManifestPath = fileURLToPath(new URL('../../../docs/operations/change-manifests/service-ru-publication-v3.json', import.meta.url));
const migrationPath = fileURLToPath(new URL('../../../infrastructure/database/content-changes/002_service_ru_review.sql', import.meta.url));
const composePath = fileURLToPath(new URL('../../../infrastructure/docker/compose.yml', import.meta.url));
const wrapperPath = fileURLToPath(new URL('../../../infrastructure/database/apply-service-ru-review.sh', import.meta.url));
const packagePath = fileURLToPath(new URL('../../../package.json', import.meta.url));

describe('service-ru review candidate', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    target_page_id: string;
    page_status: string;
    workflow_status: string;
    base_version: number;
    candidate_version: number;
    rollback_reference: string;
    changes: Array<{ id: string; field: string; from: string; to: string }>;
  };
  const publicationManifest = JSON.parse(readFileSync(publicationManifestPath, 'utf8')) as {
    review_status: string;
    content_version: number;
    publication_scope: string;
  };
  const migration = readFileSync(migrationPath, 'utf8');
  const compose = readFileSync(composePath, 'utf8');
  const wrapper = readFileSync(wrapperPath, 'utf8');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { scripts: Record<string, string> };
  const page = mortgageHubFixture.pages.find((candidate) => candidate.id === manifest.target_page_id);
  const blockChange = manifest.changes[0];

  it('preserves the review manifest and reflects the approved v3 publication in the fixture', () => {
    expect(manifest.page_status).toBe('draft');
    expect(manifest.workflow_status).toBe('in_review');
    expect(publicationManifest.review_status).toBe('Approved');
    expect(publicationManifest.content_version).toBe(3);
    expect(publicationManifest.publication_scope).toBe('local_only');
    expect(page?.status).toBe('published');
    expect(blockChange?.id).toBe('service-body-ru');
    expect(blockChange?.field).toBe('body');
    expect(page?.blocks.find((block) => block.id === blockChange?.id)?.body).toBe(blockChange?.to);
  });

  it('uses separate immutable rollback and candidate versions', () => {
    expect(manifest.workflow_status).toBe('in_review');
    expect(manifest.base_version).toBe(2);
    expect(manifest.candidate_version).toBe(3);
    expect(manifest.rollback_reference).toBe('language_versions:service-ru:2');
    expect(blockChange?.from).not.toBe(blockChange?.to);
    expect(migration).toContain("'schema_version', 1");
    expect(migration).toContain("'blocks'");
    expect(migration).toContain(blockChange?.from);
    expect(migration).toContain(blockChange?.to);
  });

  it('applies the reviewed content change after the baseline seed on fresh volumes', () => {
    expect(compose).toContain('001_mortgage_hub.sql:/docker-entrypoint-initdb.d/20-mortgage-seed.sql:ro');
    expect(compose).toContain('002_service_ru_review.sql:/docker-entrypoint-initdb.d/30-service-ru-review.sql:ro');
  });

  it('supports both local psql and the documented Docker Compose fallback', () => {
    expect(packageJson.scripts['db:prepare-service-ru-review']).toBe('bash infrastructure/database/apply-service-ru-review.sh');
    expect(wrapper).toContain('command -v psql');
    expect(wrapper).toContain('${DATABASE_URL:-}');
    expect(wrapper).toContain('docker compose --env-file .env -f infrastructure/docker/compose.yml exec -T database');
    expect(wrapper).toContain('002_service_ru_review.sql');
  });
});
