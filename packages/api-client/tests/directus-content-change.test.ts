import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { applyDirectusContentChange, verifyRenderedContentChange } from '../src/content-change';
import { mortgageHubFixture, mortgageHubFixtureVersions } from '../src/fixture';

const applyManifest = JSON.parse(readFileSync(fileURLToPath(new URL(
  '../../../docs/operations/change-manifests/service-ru-directus-v5.json',
  import.meta.url
)), 'utf8')) as Record<string, unknown>;
const rollbackManifest = JSON.parse(readFileSync(fileURLToPath(new URL(
  '../../../docs/operations/change-manifests/service-ru-directus-v6-rollback.json',
  import.meta.url
)), 'utf8')) as Record<string, unknown>;
const wrapper = readFileSync(fileURLToPath(new URL(
  '../../../infrastructure/database/apply-directus-content-change.sh',
  import.meta.url
)), 'utf8');
const packageJson = JSON.parse(readFileSync(fileURLToPath(new URL('../../../package.json', import.meta.url)), 'utf8')) as {
  scripts: Record<string, string>;
};
const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const operatorCli = fileURLToPath(new URL('../../../infrastructure/database/apply-directus-content-change.ts', import.meta.url));

function directusMock() {
  const page = mortgageHubFixture.pages.find((candidate) => candidate.id === 'service-ru')!;
  const pages = [{
    id: page.id,
    hub_id: page.hubId,
    translation_group: page.translationGroup,
    language: page.language,
    status: page.status
  }];
  const versions = structuredClone(mortgageHubFixtureVersions.filter((version) => version.version <= 4));
  const tasks: unknown[] = [];
  const calls: Array<{ method: string; path: string }> = [];

  const fetchMock: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const method = init?.method ?? 'GET';
    calls.push({ method, path: url.pathname });
    if (method === 'GET' && url.pathname === '/items/pages/service-ru') return json({ data: pages[0] });

    const collection = url.pathname.split('/').at(-1);
    if (method === 'POST') {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      if (collection === 'language_versions') versions.push(body as never);
      else if (collection === 'change_tasks') tasks.push(body);
      else return json({ errors: [{ message: 'unexpected write' }] }, 400);
      return json({ data: body });
    }

    if (collection === 'language_versions') {
      const version = url.searchParams.get('filter[version][_eq]');
      return json({ data: versions.filter((candidate) => version === null || candidate.version === Number(version)) });
    }
    if (collection === 'change_tasks') {
      const id = url.searchParams.get('filter[id][_eq]');
      return json({ data: tasks.filter((candidate) => id === null || (candidate as { id: string }).id === id) });
    }
    return json({ errors: [{ message: 'not found' }] }, 404);
  };

  return { fetchMock, versions, tasks, calls };
}

describe('Directus-originated content change', () => {
  it('creates v5 and its ChangeTask through REST without writing published collections', async () => {
    const directus = directusMock();
    await applyDirectusContentChange(applyManifest, {
      baseUrl: 'http://directus.test', token: 'server-only-test-token', fetchImpl: directus.fetchMock
    });

    expect(directus.versions.map((version) => version.version)).toEqual([3, 4, 5]);
    expect(directus.tasks).toHaveLength(1);
    expect(directus.calls.filter((call) => call.method === 'POST').map((call) => call.path)).toEqual([
      '/items/language_versions', '/items/change_tasks'
    ]);
    expect(directus.calls.some((call) => call.method !== 'GET' && call.path.includes('/pages'))).toBe(false);
    expect(directus.calls.some((call) => call.method !== 'GET' && call.path.includes('/content_blocks'))).toBe(false);
  });

  it('is idempotent and creates append-only v6 rollback while retaining v5', async () => {
    const directus = directusMock();
    const options = { baseUrl: 'http://directus.test', token: 'server-only-test-token', fetchImpl: directus.fetchMock };
    await applyDirectusContentChange(applyManifest, options);
    await applyDirectusContentChange(applyManifest, options);
    await applyDirectusContentChange(rollbackManifest, options);

    expect(directus.versions.map((version) => version.version)).toEqual([3, 4, 5, 6]);
    expect(directus.tasks).toHaveLength(2);
    expect(directus.calls.filter((call) => call.method === 'POST')).toHaveLength(4);
    const version5 = directus.versions.find((version) => version.version === 5)!;
    const version6 = directus.versions.find((version) => version.version === 6)!;
    expect(version5.snapshot.blocks[0]?.body).toContain('Технический черновик Directus REST v5:');
    expect(version6.snapshot.blocks[0]?.body).toContain('Черновик версии 4:');
  });

  it('fails closed when the base snapshot does not match manifest change.from', async () => {
    const directus = directusMock();
    await expect(applyDirectusContentChange({
      ...applyManifest,
      change: { ...(applyManifest.change as object), from: 'unexpected base content' }
    }, {
      baseUrl: 'http://directus.test', token: 'server-only-test-token', fetchImpl: directus.fetchMock
    })).rejects.toThrow('does not match manifest change.from');
    expect(directus.calls.some((call) => call.method === 'POST')).toBe(false);
  });

  it('verifies public isolation, preview version and noindex from rendered HTML', async () => {
    const calls: Array<{ url: string; authorization: string | null }> = [];
    const fetchMock: typeof fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : input.toString();
      const headers = new Headers(init?.headers);
      calls.push({ url, authorization: headers.get('authorization') });
      if (url.includes(':4321')) return new Response('<html>Рабочая интеграция требует отдельной задачи</html>');
      return new Response('<html><meta content="noindex,nofollow,noarchive">PREVIEW · v5 Технический черновик Directus REST v5</html>', {
        headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
      });
    };
    await expect(verifyRenderedContentChange(applyManifest, fetchMock, 'Basic test')).resolves.toEqual({ publicStatus: 200, previewStatus: 200 });
    expect(calls).toEqual([
      { url: 'http://localhost:4321/ru/ipoteka/konsultaciya', authorization: null },
      { url: 'http://localhost:4322/ru/ipoteka/konsultaciya', authorization: 'Basic test' }
    ]);
  });

  it('gates both operator commands with a verified backup and server-only credential', () => {
    expect(wrapper.indexOf('pnpm --silent backup')).toBeLessThan(wrapper.indexOf('pnpm --silent exec tsx'));
    expect(wrapper).toContain('gzip -t "$backup_file"');
    expect(wrapper).toContain('DIRECTUS_ADMIN_TOKEN is required in .env');
    expect(wrapper).not.toMatch(/printf[^\n]*DIRECTUS_ADMIN_TOKEN/);
    expect(packageJson.scripts['directus:apply-service-ru-v5']).toContain('service-ru-directus-v5.json');
    expect(packageJson.scripts['directus:rollback-service-ru-v6']).toContain('service-ru-directus-v6-rollback.json');
  });

  it('starts the operator CLI under the repository CommonJS tsx runtime', () => {
    const result = spawnSync('pnpm', ['exec', 'tsx', operatorCli], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      timeout: 10_000
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Usage: apply-directus-content-change.ts <manifest.json>');
    expect(result.stderr).not.toContain('Top-level await is currently not supported');
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
