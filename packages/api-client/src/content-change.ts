import { isDeepStrictEqual } from 'node:util';
import {
  DirectusContentChangeManifestSchema,
  LanguageVersionSnapshotSchema,
  type DirectusContentChangeManifest,
  type LanguageVersionSnapshot
} from '@domus/content-model';

type Fetch = typeof fetch;
type DirectusPage = {
  id: string;
  hub_id: string;
  translation_group: string;
  language: 'pl' | 'ru';
  status: 'draft' | 'published' | 'archived';
};
type DirectusVersion = {
  page_id: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  snapshot: unknown;
};
type DirectusTask = {
  id: string;
  title: string;
  scope: string;
  status: string;
  target_page_id: string;
  base_version: number;
  candidate_version: number;
  preview_url: string;
  rollback_reference: string;
};

type ApplyOptions = {
  baseUrl: string;
  token: string;
  fetchImpl?: Fetch;
};

export async function applyDirectusContentChange(input: unknown, options: ApplyOptions) {
  const manifest = DirectusContentChangeManifestSchema.parse(input);
  const fetchImpl = options.fetchImpl ?? fetch;
  const page = await getItem<DirectusPage>(options, fetchImpl, `pages/${encodeURIComponent(manifest.target_page_id)}`);
  if (page.status !== 'published') throw new Error(`${page.id} must remain published while creating a draft revision`);

  const versions = await listItems<DirectusVersion>(options, fetchImpl, 'language_versions', {
    'filter[page_id][_eq]': manifest.target_page_id
  });
  const baseVersion = requireVersion(versions, manifest.base_version, 'base');
  const sourceVersion = requireVersion(versions, manifest.snapshot_source_version, 'snapshot source');
  const baseSnapshot = parseSnapshot(baseVersion, page);
  const sourceSnapshot = parseSnapshot(sourceVersion, page);
  const baseBlock = requireBlock(baseSnapshot, manifest.change.block_id);
  if (baseBlock.body !== manifest.change.from) throw new Error(`Base version ${baseVersion.version} does not match manifest change.from`);

  const candidateSnapshot = structuredClone(sourceSnapshot);
  candidateSnapshot.page.status = page.status;
  requireBlock(candidateSnapshot, manifest.change.block_id).body = manifest.change.to;
  const candidatePayload: DirectusVersion = {
    page_id: manifest.target_page_id,
    version: manifest.candidate_version,
    status: manifest.candidate_status,
    snapshot: candidateSnapshot
  };

  const existingCandidate = versions.find((version) => version.version === manifest.candidate_version);
  if (existingCandidate) {
    assertVersionMatches(existingCandidate, candidatePayload);
  } else {
    await createItem(options, fetchImpl, 'language_versions', candidatePayload);
  }

  const taskPayload: DirectusTask = {
    id: manifest.task_id,
    title: manifest.title,
    scope: manifest.scope,
    status: manifest.workflow_status,
    target_page_id: manifest.target_page_id,
    base_version: manifest.base_version,
    candidate_version: manifest.candidate_version,
    preview_url: manifest.preview_url,
    rollback_reference: manifest.rollback_reference
  };
  const tasks = await listItems<DirectusTask>(options, fetchImpl, 'change_tasks', {
    'filter[id][_eq]': manifest.task_id
  });
  if (tasks[0]) {
    assertTaskMatches(tasks[0], taskPayload);
  } else {
    await createItem(options, fetchImpl, 'change_tasks', taskPayload);
  }

  const [storedCandidate] = await listItems<DirectusVersion>(options, fetchImpl, 'language_versions', {
    'filter[page_id][_eq]': manifest.target_page_id,
    'filter[version][_eq]': String(manifest.candidate_version)
  });
  const [storedTask] = await listItems<DirectusTask>(options, fetchImpl, 'change_tasks', {
    'filter[id][_eq]': manifest.task_id
  });
  if (!storedCandidate || !storedTask) throw new Error('Directus content change readback is incomplete');
  assertVersionMatches(storedCandidate, candidatePayload);
  assertTaskMatches(storedTask, taskPayload);

  return { manifest, candidate: storedCandidate, task: storedTask };
}

export async function verifyRenderedContentChange(manifestInput: unknown, fetchImpl: Fetch = fetch) {
  const manifest = DirectusContentChangeManifestSchema.parse(manifestInput);
  const [publicResponse, previewResponse] = await Promise.all([
    fetchImpl(manifest.public_url),
    fetchImpl(manifest.preview_url)
  ]);
  const [publicBody, previewBody] = await Promise.all([publicResponse.text(), previewResponse.text()]);
  if (!publicResponse.ok || !previewResponse.ok) throw new Error(`Rendered readback failed: public=${publicResponse.status} preview=${previewResponse.status}`);
  if (!publicBody.includes(manifest.verification.public_body) || publicBody.includes(manifest.change.to)) {
    throw new Error('Published page changed while applying a Directus draft revision');
  }
  if (!previewBody.includes(manifest.verification.preview_body)) throw new Error('Preview does not contain the expected candidate body');
  if (!previewBody.includes(`PREVIEW · v${manifest.candidate_version}`)) throw new Error('Preview version banner is missing');
  if (!previewBody.includes('noindex,nofollow,noarchive')) throw new Error('Preview noindex boundary is missing');
  return { publicStatus: publicResponse.status, previewStatus: previewResponse.status };
}

function parseSnapshot(version: DirectusVersion, page: DirectusPage): LanguageVersionSnapshot {
  const snapshot = LanguageVersionSnapshotSchema.parse(version.snapshot);
  if (
    snapshot.page.id !== page.id ||
    snapshot.page.hub_id !== page.hub_id ||
    snapshot.page.translation_group !== page.translation_group ||
    snapshot.page.language !== page.language
  ) {
    throw new Error(`Language version ${page.id} v${version.version} has mismatched page identity`);
  }
  return snapshot;
}

function requireVersion(versions: DirectusVersion[], version: number, label: string) {
  const row = versions.find((candidate) => candidate.version === version);
  if (!row) throw new Error(`Missing ${label} language version ${version}`);
  return row;
}

function requireBlock(snapshot: LanguageVersionSnapshot, blockId: string) {
  const block = snapshot.blocks.find((candidate) => candidate.id === blockId);
  if (!block) throw new Error(`Snapshot does not contain block ${blockId}`);
  return block;
}

function assertVersionMatches(actual: DirectusVersion, expected: DirectusVersion) {
  if (
    actual.page_id !== expected.page_id ||
    actual.version !== expected.version ||
    actual.status !== expected.status ||
    !isDeepStrictEqual(actual.snapshot, expected.snapshot)
  ) {
    throw new Error(`Existing language version ${expected.page_id} v${expected.version} differs from the manifest`);
  }
}

function assertTaskMatches(actual: DirectusTask, expected: DirectusTask) {
  for (const key of Object.keys(expected) as Array<keyof DirectusTask>) {
    if (actual[key] !== expected[key]) throw new Error(`Existing change task ${expected.id} differs at ${key}`);
  }
}

async function getItem<T>(options: ApplyOptions, fetchImpl: Fetch, path: string): Promise<T> {
  return request<T>(options, fetchImpl, path);
}

async function listItems<T>(options: ApplyOptions, fetchImpl: Fetch, collection: string, query: Record<string, string>): Promise<T[]> {
  const response = await request<{ data: T[] }>(options, fetchImpl, collection, { query, unwrap: false });
  return response.data;
}

async function createItem<T>(options: ApplyOptions, fetchImpl: Fetch, collection: string, body: T): Promise<void> {
  await request(options, fetchImpl, collection, { method: 'POST', body, unwrap: false });
}

async function request<T>(
  options: ApplyOptions,
  fetchImpl: Fetch,
  path: string,
  requestOptions: { query?: Record<string, string>; method?: 'POST'; body?: unknown; unwrap?: boolean } = {}
): Promise<T> {
  const url = new URL(`/items/${path}`, options.baseUrl);
  for (const [key, value] of Object.entries(requestOptions.query ?? {})) url.searchParams.set(key, value);
  const response = await fetchImpl(url, {
    method: requestOptions.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${options.token}`,
      ...(requestOptions.body === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body)
  });
  if (!response.ok) throw new Error(`Directus ${requestOptions.method ?? 'GET'} ${path}: ${response.status}`);
  const json = await response.json() as { data: T } | T;
  return (requestOptions.unwrap === false ? json : (json as { data: T }).data) as T;
}

export type { DirectusContentChangeManifest };
