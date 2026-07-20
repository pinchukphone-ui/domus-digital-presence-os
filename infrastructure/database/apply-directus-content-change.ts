import { readFile } from 'node:fs/promises';
import { applyDirectusContentChange, verifyRenderedContentChange } from '@domus/api-client/content-change';

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error('Usage: apply-directus-content-change.ts <manifest.json>');

  const baseUrl = process.env.DIRECTUS_PUBLIC_URL;
  const token = process.env.DIRECTUS_ADMIN_TOKEN;
  if (!baseUrl) throw new Error('DIRECTUS_PUBLIC_URL is required');
  if (!token) throw new Error('DIRECTUS_ADMIN_TOKEN is required');

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as unknown;
  const result = await applyDirectusContentChange(manifest, { baseUrl, token });
  await verifyRenderedContentChange(result.manifest);

  console.log(`Directus REST change verified: ${result.candidate.page_id} v${result.candidate.version}, task=${result.task.id}`);
}

void main();
