import { randomBytes } from 'node:crypto';
import { chmod, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type PreviewCredentials = {
  directusToken: string;
  authUser: string;
  authPassword: string;
};

export function rotatePreviewCredentials(contents: string, credentials: PreviewCredentials) {
  let updated = contents;
  for (const [key, value] of [
    ['DIRECTUS_PREVIEW_TOKEN', credentials.directusToken],
    ['PREVIEW_AUTH_USER', credentials.authUser],
    ['PREVIEW_AUTH_PASSWORD', credentials.authPassword]
  ] as const) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    updated = pattern.test(updated) ? updated.replace(pattern, line) : `${updated.replace(/\s*$/, '\n')}${line}\n`;
  }
  return updated;
}

async function main() {
  const environmentPath = resolve('.env');
  const contents = await readFile(environmentPath, 'utf8');
  const updated = rotatePreviewCredentials(contents, {
    directusToken: randomBytes(32).toString('hex'),
    authUser: 'preview',
    authPassword: randomBytes(32).toString('base64url')
  });
  const temporaryPath = `${environmentPath}.preview-rotation-${process.pid}`;
  await writeFile(temporaryPath, updated, { encoding: 'utf8', mode: 0o600 });
  await rename(temporaryPath, environmentPath);
  await chmod(environmentPath, 0o600);
  console.log('Local preview credentials rotated in .env; values were not printed.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) void main();
