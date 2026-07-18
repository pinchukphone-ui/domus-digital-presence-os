import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const manifestPath = fileURLToPath(new URL('../../../docs/operations/change-manifests/service-ru-preview-v4.json', import.meta.url));
const changePath = fileURLToPath(new URL('../../../infrastructure/database/content-changes/004_service_ru_preview_v4.sql', import.meta.url));
const wrapperPath = fileURLToPath(new URL('../../../infrastructure/database/prepare-service-ru-preview-v4.sh', import.meta.url));
const composePath = fileURLToPath(new URL('../../../infrastructure/docker/compose.yml', import.meta.url));
const packagePath = fileURLToPath(new URL('../../../package.json', import.meta.url));

describe('service-ru version 4 preview candidate', () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    public_version: number;
    candidate_version: number;
    candidate_status: string;
    workflow_status: string;
    rollback_reference: string;
    external_deployment: boolean;
  };
  const change = readFileSync(changePath, 'utf8');
  const wrapper = readFileSync(wrapperPath, 'utf8');
  const compose = readFileSync(composePath, 'utf8');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { scripts: Record<string, string> };

  it('records a draft candidate over the published version without deployment', () => {
    expect(manifest.public_version).toBe(3);
    expect(manifest.candidate_version).toBe(4);
    expect(manifest.candidate_status).toBe('draft');
    expect(manifest.workflow_status).toBe('in_review');
    expect(manifest.rollback_reference).toBe('language_versions:service-ru:3');
    expect(manifest.external_deployment).toBe(false);
  });

  it('inserts an immutable snapshot and never updates published page data', () => {
    expect(change).toContain("4,\n  'draft'");
    expect(change).toContain("published.status = 'published'");
    expect(change).toContain("candidate.status = 'draft'");
    expect(change).not.toMatch(/UPDATE\s+(pages|content_blocks|language_versions)/i);
  });

  it('is an explicit operator command outside automatic bootstrap', () => {
    expect(packageJson.scripts['db:prepare-service-ru-preview-v4']).toBe('bash infrastructure/database/prepare-service-ru-preview-v4.sh');
    expect(wrapper).toContain('004_service_ru_preview_v4.sql');
    expect(compose).not.toContain('004_service_ru_preview_v4.sql:/docker-entrypoint-initdb.d');
  });
});
