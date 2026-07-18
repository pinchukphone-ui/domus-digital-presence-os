import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const manifestPath = fileURLToPath(new URL('../../../docs/operations/change-manifests/service-ru-publication-v3.json', import.meta.url));
const publicationPath = fileURLToPath(new URL('../../../infrastructure/database/content-changes/003_publish_service_ru.sql', import.meta.url));
const wrapperPath = fileURLToPath(new URL('../../../infrastructure/database/publish-service-ru-local.sh', import.meta.url));
const composePath = fileURLToPath(new URL('../../../infrastructure/docker/compose.yml', import.meta.url));
const packagePath = fileURLToPath(new URL('../../../package.json', import.meta.url));

describe('service-ru local publication', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    review_status: string;
    content_version: number;
    rollback_version: number;
    publication_scope: string;
    public_url: string;
    source_commit: string;
    source_image_digest: string;
    external_deployment: boolean;
    rollback_reference: string;
  };
  const publication = readFileSync(publicationPath, 'utf8');
  const wrapper = readFileSync(wrapperPath, 'utf8');
  const compose = readFileSync(composePath, 'utf8');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { scripts: Record<string, string> };

  it('records the approved version, immutable source and local-only boundary', () => {
    expect(manifest.review_status).toBe('Approved');
    expect(manifest.content_version).toBe(3);
    expect(manifest.rollback_version).toBe(2);
    expect(manifest.rollback_reference).toBe('language_versions:service-ru:2');
    expect(manifest.publication_scope).toBe('local_only');
    expect(manifest.public_url).toBe('http://localhost:4321/ru/ipoteka/konsultaciya');
    expect(manifest.source_commit).toMatch(/^[a-f0-9]{40}$/);
    expect(manifest.source_image_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(manifest.external_deployment).toBe(false);
  });

  it('publishes only the approved candidate and preserves the rollback reference', () => {
    expect(publication).toContain("page.status IN ('draft', 'published')");
    expect(publication).toContain("task.status IN ('in_review', 'approved')");
    expect(publication).toContain("SET status = 'published'");
    expect(publication).toContain("status = 'approved'");
    expect(publication).toContain('language_versions:service-ru:2');
    expect(publication).not.toContain("status = 'deployed'");
  });

  it('is an explicit operator command and never part of automatic bootstrap', () => {
    expect(packageJson.scripts['db:publish-service-ru-local']).toBe('bash infrastructure/database/publish-service-ru-local.sh');
    expect(wrapper).toContain('command -v psql');
    expect(wrapper).toContain('docker compose --env-file .env -f infrastructure/docker/compose.yml exec -T database');
    expect(wrapper).toContain('003_publish_service_ru.sql');
    expect(compose).not.toContain('003_publish_service_ru.sql:/docker-entrypoint-initdb.d');
  });
});
