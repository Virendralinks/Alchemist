// scripts/build-index-entry.ts
//
// Entry point bundled by scripts/build-index.mjs. Exists so the builder can be
// TypeScript (and share path aliases) while the npm script stays plain Node.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { buildRhymeIndex, indexStats, INDEX_VERSION } from '../lib/engine/index-builder';

export function run(outPath = join(process.cwd(), 'public', 'rhyme-index.json')): {
  path: string;
  bytes: number;
  gzipBytes: number;
  stats: ReturnType<typeof indexStats> & { version: number };
} {
  const index = buildRhymeIndex();
  const json = JSON.stringify(index);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, json);
  const gzipBytes = gzipSync(Buffer.from(json)).length;
  const stats = indexStats(index);
  return {
    path: outPath,
    bytes: Buffer.byteLength(json),
    gzipBytes,
    stats: { ...stats, version: INDEX_VERSION },
  };
}

if (require.main === module) {
  const result = run();
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        path: result.path,
        bytes: result.bytes,
        gzipBytes: result.gzipBytes,
        ...result.stats,
      },
      null,
      2,
    ),
  );
}
