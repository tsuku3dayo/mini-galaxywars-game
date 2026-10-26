#!/usr/bin/env node
// 成果物の整合性チェック（doc/workflow.txt「整合性チェックの自動化」）
// 使い方: npm run check:docs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOC_DIR = join(ROOT, 'doc');
const SPEC_PATH = 'doc/specification.md';
const PREFIX = 'MGW';

// 種類コード → 種類名・置き場所・承認の有無
const TYPES = {
  PB: { name: 'project-brief', dir: 'doc/00-project-brief', approval: true },
  SA: { name: 'system-architecture', dir: 'doc/01-system', approval: true },
  TS: { name: 'technology-stack', dir: 'doc/01-system', approval: true },
  ADR: { name: 'architecture-decision', dir: 'doc/01-system', approval: true },
  EP: { name: 'epic', dir: 'doc/02-requirements', approval: true },
  US: { name: 'user-story', dir: 'doc/02-requirements', approval: true },
  GUI: { name: 'gui-design', dir: 'doc/03-gui', approval: true },
  TD: { name: 'technical-design', dir: 'doc/04-design', approval: false },
  TST: { name: 'test-strategy', dir: 'doc/05-test', approval: false },
  TC: { name: 'test-case', dir: 'doc/05-test', approval: false },
  WS: { name: 'workstream', dir: 'doc/06-plan', approval: false },
  TASK: { name: 'implementation-task', dir: 'doc/06-plan', approval: false },
  AC: { name: 'attested-computation', dir: 'doc/07-attested', approval: true },
};
const TYPE_DIRS = new Set(Object.values(TYPES).map((t) => t.dir));
const REQUIRED_KEYS = ['id', 'type', 'title', 'status', 'version', 'updated', 'sources', 'verified'];
const STATUSES = new Set(['draft', 'review', 'stable']);

const ID_RE = new RegExp(`\\b${PREFIX}-([A-Z]+)-(\\d{4})\\b`, 'g');
// 確認 ID: <TC の ID>-<2 桁>（例: MGW-TC-0001-01）
const CHECK_ID_RE = new RegExp(`\\b${PREFIX}-TC-\\d{4}-\\d{2}\\b`, 'g');
// 版つきの参照: MGW-US-0007（v1.1） / MGW-US-0007 (v1.1)
const VERSIONED_REF_RE = new RegExp(`\\b(${PREFIX}-[A-Z]+-\\d{4})\\s*[（(]v([\\d.]+)[)）]`, 'g');

const errors = [];
const warnings = [];
const rel = (p) => relative(ROOT, p).split(sep).join('/');

function walk(dir, filter) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

// frontmatter の小さな YAML 解析（key: value / key: の下の「- 項目」または「key: value」）
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const data = {};
  let current = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const top = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (top) {
      const [, key, value] = top;
      current = key;
      data[key] = value === '' ? undefined : unquote(value);
      continue;
    }
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && current) {
      if (!Array.isArray(data[current])) data[current] = [];
      data[current].push(unquote(item[1]));
      continue;
    }
    const nested = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (nested && current) {
      if (typeof data[current] !== 'object' || Array.isArray(data[current])) data[current] = {};
      data[current][nested[1]] = unquote(nested[2]);
    }
  }
  return { data, body: text.slice(m[0].length) };
}

function unquote(v) {
  const s = v.trim();
  if (s === 'null' || s === '~') return null;
  if (s === '[]') return [];
  if (/^(['"]).*\1$/.test(s)) return s.slice(1, -1);
  return s;
}

function specVersion() {
  const p = join(ROOT, SPEC_PATH);
  if (!existsSync(p)) {
    errors.push(`${SPEC_PATH} がありません`);
    return null;
  }
  const m = readFileSync(p, 'utf8').match(/\*\*版\*\*[:：]\s*([\d.]+)/);
  if (!m) errors.push(`${SPEC_PATH} に「**版**：」の行がありません`);
  return m ? m[1] : null;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

// ---- 成果物を集める ----
const docs = new Map(); // id → { file, data, body, code }
const SPEC_VERSION = specVersion();

const mdFiles = walk(DOC_DIR, (p) => p.endsWith('.md'));
for (const file of mdFiles) {
  const r = rel(file);
  const name = basename(file);
  const inTypeDir = TYPE_DIRS.has(rel(dirname(file)));
  const looksLikeArtifact = name.startsWith(`${PREFIX}-`);
  if (!inTypeDir && !looksLikeArtifact) continue; // 仕様書・依頼メモなど

  const parsed = parseFrontmatter(readFileSync(file, 'utf8').replace(/^﻿/, ''));
  if (!parsed) {
    errors.push(`${r}: frontmatter がありません`);
    continue;
  }
  const { data, body } = parsed;
  for (const key of REQUIRED_KEYS) {
    if (!(key in data)) errors.push(`${r}: frontmatter に ${key} がありません`);
  }
  const idMatch = String(data.id ?? '').match(new RegExp(`^${PREFIX}-([A-Z]+)-(\\d{4})$`));
  if (!idMatch) {
    errors.push(`${r}: id「${data.id}」が ${PREFIX}-<種類>-<4 桁> の形ではありません`);
    continue;
  }
  const code = idMatch[1];
  const type = TYPES[code];
  if (!type) {
    errors.push(`${r}: 種類「${code}」は決まりにありません`);
    continue;
  }
  if (data.type !== type.name) errors.push(`${r}: type は ${type.name} のはずです（${data.type}）`);
  const expectedName = `${data.id}-${type.name}-ja.md`;
  if (name !== expectedName) errors.push(`${r}: ファイル名は ${expectedName} のはずです`);
  if (rel(dirname(file)) !== type.dir) errors.push(`${r}: 置き場所は ${type.dir}/ のはずです`);
  if (!STATUSES.has(data.status)) errors.push(`${r}: status「${data.status}」は draft・review・stable のどれかです`);
  if (!/^\d+\.\d+$/.test(String(data.version ?? ''))) errors.push(`${r}: version「${data.version}」は 1.0 の形です`);
  if (docs.has(data.id)) {
    errors.push(`${r}: id ${data.id} が ${docs.get(data.id).file} と重複しています`);
    continue;
  }
  docs.set(data.id, { file: r, data, body, code });
}

// ---- 参照・版・状態 ----
for (const [id, doc] of docs) {
  const { file, data, body, code } = doc;
  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (!Array.isArray(data.sources)) errors.push(`${file}: sources はリスト（- 項目）で書きます`);

  for (const src of sources) {
    const versioned = [...src.matchAll(VERSIONED_REF_RE)];
    const ids = [...src.matchAll(ID_RE)].map((m) => m[0]);
    for (const ref of ids) {
      const target = docs.get(ref);
      if (!target) continue; // 実在しないものは下の本文チェックで出す
      const v = versioned.find((m) => m[1] === ref);
      if (!v) warnings.push(`${file}: sources の ${ref} に版が書いていません`);
      else if (v[2] !== String(target.data.version))
        errors.push(`${file}: sources の ${ref}（v${v[2]}）が今の版（v${target.data.version}）と違います`);
      if (data.status === 'stable' && target.data.status !== 'stable')
        errors.push(`${file}: stable なのに sources の ${ref} が ${target.data.status} です`);
    }
    if (src.includes(SPEC_PATH)) {
      const sv = src.match(/[（(]v([\d.]+)[)）]/);
      if (!sv) warnings.push(`${file}: sources の仕様書に版が書いていません`);
      else if (SPEC_VERSION && compareVersions(sv[1], SPEC_VERSION) < 0)
        warnings.push(`${file}: sources の仕様書 v${sv[1]} は今の版 v${SPEC_VERSION} より古い（引用した章が変わっていないか確かめる）`);
    }
  }

  const refs = new Set([...`${sources.join('\n')}\n${body}`.matchAll(ID_RE)].map((m) => m[0]));
  for (const ref of refs) {
    if (ref !== id && !docs.has(ref)) errors.push(`${file}: ${ref} が実在しません`);
  }

  if (TYPES[code].approval && data.status === 'stable') {
    const v = data.verified;
    if (!v || typeof v !== 'object' || !v.by || !v.at)
      errors.push(`${file}: stable の承認のある成果物には verified（by・at）が要ります`);
  }
}

// ---- 確認 ID ----
const definedChecks = new Map(); // 確認 ID → 'auto' | 'manual'
for (const doc of docs.values()) {
  if (doc.code !== 'TC') continue;
  for (const line of doc.body.split(/\r?\n/)) {
    for (const m of line.matchAll(CHECK_ID_RE)) {
      if (!definedChecks.has(m[0])) definedChecks.set(m[0], line.includes('手動') ? 'manual' : 'auto');
    }
  }
}

const codeFiles = [
  ...walk(join(ROOT, 'tests'), (p) => /\.[cm]?[jt]sx?$/.test(p)),
  ...walk(join(ROOT, 'e2e'), (p) => /\.[cm]?[jt]sx?$/.test(p)),
  ...walk(join(ROOT, 'src'), (p) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(p)),
  ...walk(join(ROOT, 'scripts'), (p) => /\.[cm]?[jt]sx?$/.test(p) && !p.endsWith('check-docs.mjs')),
];
const checksInCode = new Set();
for (const file of codeFiles) {
  for (const m of readFileSync(file, 'utf8').matchAll(CHECK_ID_RE)) {
    checksInCode.add(m[0]);
    if (!definedChecks.has(m[0])) errors.push(`${rel(file)}: 確認 ID ${m[0]} が test-case にありません`);
  }
}
const checksInAc = new Set();
for (const doc of docs.values()) {
  if (doc.code === 'AC') for (const m of doc.body.matchAll(CHECK_ID_RE)) checksInAc.add(m[0]);
}
for (const [check, kind] of definedChecks) {
  if (kind === 'auto' && !checksInCode.has(check))
    errors.push(`確認 ID ${check}（自動）がテストのコードにありません`);
  if (kind === 'manual' && !checksInAc.has(check))
    errors.push(`確認 ID ${check}（手動）が attested-computation にありません`);
}

// ---- 結果 ----
for (const w of warnings) console.log(`注意: ${w}`);
for (const e of errors) console.error(`エラー: ${e}`);
console.log(`check:docs — 成果物 ${docs.size} 件、確認 ID ${definedChecks.size} 件、エラー ${errors.length} 件、注意 ${warnings.length} 件`);
process.exit(errors.length > 0 ? 1 : 0);
