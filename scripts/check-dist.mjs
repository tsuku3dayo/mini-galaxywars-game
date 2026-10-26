#!/usr/bin/env node
// dist の検査（MGW-TD-0007 §4）。使い方: npm run build のあと npm run check:dist
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const BASE = '/mini-galaxywars-game/';

const errors = [];
const check = (ok, message) => {
  if (!ok) errors.push(message);
};
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

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

// MGW-TC-0002-03 公開するファイルに外部の URL（CDN・Web フォントなど）がない
// 許すのは、自分の公開先と、通信しない文字列だけ（XML の名前空間、Workbox のエラーの説明文の URL）
const ALLOWED_URL = [/^https:\/\/tsuku3dayo\.github\.io\//, /^http:\/\/www\.w3\.org\//, /^https:\/\/bit\.ly\/wb-precache$/];
const TEXT_FILE = /\.(?:html|js|css|webmanifest|json)$/;
const files = walk(DIST).filter((p) => TEXT_FILE.test(p) && !relative(DIST, p).startsWith('prototype'));
for (const file of files) {
  for (const m of readFileSync(file, 'utf8').matchAll(/https?:\/\/[^\s"'`)<>\\]+/g)) {
    if (!ALLOWED_URL.some((re) => re.test(m[0]))) errors.push(`${relative(DIST, file)} に外部の URL があります: ${m[0]}`);
  }
}

// MGW-TC-0002-04 マニフェストの name が「ギャラクシーウォーズミニ」で、Service Worker の範囲が /mini-galaxywars-game/
const manifestPath = join(DIST, 'manifest.webmanifest');
if (!existsSync(manifestPath)) {
  errors.push('manifest.webmanifest がありません');
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  check(manifest.name === 'ギャラクシーウォーズミニ', `manifest の name が違います: ${manifest.name}`);
  check(manifest.short_name === 'GWミニ', `manifest の short_name が違います: ${manifest.short_name}`);
  check(manifest.scope === BASE, `manifest の scope が違います: ${manifest.scope}`);
  check(manifest.start_url === BASE, `manifest の start_url が違います: ${manifest.start_url}`);
  check(index.includes('manifest.webmanifest'), 'index.html がマニフェストを読んでいません');
}
const swPath = join(DIST, 'sw.js');
if (!existsSync(swPath)) {
  errors.push('sw.js がありません');
} else {
  // sw.js は dist の直下（= /mini-galaxywars-game/）に置かれるので、範囲は /mini-galaxywars-game/ になる
  check(readFileSync(swPath, 'utf8').includes('mini-galaxywars'), 'sw.js のキャッシュの名前に mini-galaxywars がありません');
}

for (const e of errors) console.error(`エラー: ${e}`);
console.log(`check:dist — エラー ${errors.length} 件`);
process.exit(errors.length > 0 ? 1 : 0);
