#!/usr/bin/env node
// dist の検査（MGW-TD-0007 §4）。使い方: npm run build のあと npm run check:dist
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const BASE = '/mini-galaxywars-game/';

const errors = [];
const check = (ok, message) => {
  if (!ok) errors.push(message);
};

const indexPath = join(DIST, 'index.html');
if (!existsSync(indexPath)) {
  console.error('エラー: dist/index.html がありません（先に npm run build）');
  process.exit(1);
}
const index = readFileSync(indexPath, 'utf8');

// index.html の資源の参照が base で始まる（MGW-US-0001）
for (const m of index.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const ref = m[1];
  if (/^(?:[a-z]+:|#)/i.test(ref)) continue;
  check(ref.startsWith(BASE), `index.html の参照 ${ref} が ${BASE} で始まっていません`);
}

for (const e of errors) console.error(`エラー: ${e}`);
console.log(`check:dist — エラー ${errors.length} 件`);
process.exit(errors.length > 0 ? 1 : 0);
