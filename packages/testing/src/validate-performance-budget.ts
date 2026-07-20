import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const clientDirectory = new URL('../../../apps/public-web/dist/client/', import.meta.url);
const kibibyte = 1024;
const budgets = {
  javascriptTotalGzip: 80 * kibibyte,
  javascriptSingleGzip: 65 * kibibyte,
  cssTotalGzip: 15 * kibibyte
};

type Asset = { path: string; gzipBytes: number };

async function collectAssets(directory: URL, currentPath = ''): Promise<Asset[]> {
  const entries = await readdir(new URL(currentPath || '.', directory), { withFileTypes: true });
  const assets: Asset[] = [];

  for (const entry of entries) {
    const assetPath = join(currentPath, entry.name);
    if (entry.isDirectory()) {
      assets.push(...await collectAssets(directory, assetPath));
      continue;
    }
    if (!['.js', '.css'].includes(extname(entry.name))) continue;
    const url = new URL(assetPath, directory);
    const contents = await readFile(url);
    assets.push({
      path: assetPath,
      gzipBytes: gzipSync(contents, { level: 9 }).byteLength
    });
  }
  return assets;
}

function assertBudget(label: string, actual: number, limit: number) {
  if (actual > limit) throw new Error(`${label}: ${actual} bytes exceeds ${limit} byte budget`);
}

const assets = await collectAssets(clientDirectory);
if (assets.length === 0) throw new Error('No JavaScript or CSS assets found; run the Astro build first');

const javascript = assets.filter((asset) => extname(asset.path) === '.js');
const css = assets.filter((asset) => extname(asset.path) === '.css');
const javascriptTotalGzip = javascript.reduce((total, asset) => total + asset.gzipBytes, 0);
const cssTotalGzip = css.reduce((total, asset) => total + asset.gzipBytes, 0);

assertBudget('Total client JavaScript (gzip)', javascriptTotalGzip, budgets.javascriptTotalGzip);
assertBudget('Total client CSS (gzip)', cssTotalGzip, budgets.cssTotalGzip);
for (const asset of javascript) assertBudget(`JavaScript asset ${asset.path} (gzip)`, asset.gzipBytes, budgets.javascriptSingleGzip);

console.log(
  `Performance budgets OK: JS ${javascriptTotalGzip}/${budgets.javascriptTotalGzip} bytes gzip; ` +
  `CSS ${cssTotalGzip}/${budgets.cssTotalGzip} bytes gzip; ${assets.length} client assets.`
);
