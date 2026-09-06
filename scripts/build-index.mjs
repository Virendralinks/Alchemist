// scripts/build-index.mjs
//
// Runs before `next build`. Bundles the TypeScript index builder with esbuild,
// executes it, and writes public/rhyme-index.json. The compressed size is
// asserted against the 2.5 MB budget from Section 3.10.

import * as esbuild from 'esbuild';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const cacheDir = join(root, '.cache');
const outfile = join(cacheDir, 'build-index.cjs');
const outJson = join(root, 'public', 'rhyme-index.json');

const BUDGET_GZIP_BYTES = 2.5 * 1024 * 1024;

mkdirSync(cacheDir, { recursive: true });

await esbuild.build({
  entryPoints: [join(__dirname, 'build-index-entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
  // Keep the CMUdict package external? No — the builder needs it at build time
  // and the output is a build artifact, not a browser bundle. Bundle it in.
  packages: 'bundle',
  logLevel: 'warning',
  alias: {
    '@': root,
  },
});

const require = createRequire(import.meta.url);
const mod = require(outfile);
const result = mod.run(outJson);

// Also write a tiny sidecar the budget test can read without parsing  the index.
writeFileSync(
  join(root, 'public', 'rhyme-index.meta.json'),
  JSON.stringify(
    {
      version: result.stats.version ?? 1,
      bytes: result.bytes,
      gzipBytes: result.gzipBytes,
      total: result.stats.total,
      en: result.stats.en,
      hi: result.stats.hi,
      nucleusKeys: result.stats.nucleusKeys,
      tailKeys: result.stats.tailKeys,
    },
    null,
    2,
  ),
);

const gzipBytes = result.gzipBytes ?? gzipSync(Buffer.from('')).length;

console.log(
  [
    `RhymeIndex → ${outJson}`,
    `  lexemes: ${result.stats.total} (en=${result.stats.en}, hi=${result.stats.hi})`,
    `  raw:     ${(result.bytes / 1024 / 1024).toFixed(2)} MB`,
    `  gzip:    ${(gzipBytes / 1024 / 1024).toFixed(2)} MB (budget 2.50 MB)`,
  ].join('\n'),
);

if (gzipBytes > BUDGET_GZIP_BYTES) {
  console.error(
    `ERROR: compressed index is ${(gzipBytes / 1024 / 1024).toFixed(2)} MB; budget is 2.5 MB. Trim by frequency rank.`,
  );
  process.exit(1);
}
