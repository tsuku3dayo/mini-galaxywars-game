import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';

// 層の決まり（MGW-ADR-0001）が ESLint の設定で守られていることを、ソースの断片を lint して確かめる
const eslint = new ESLint({ cwd: process.cwd() });

async function ruleIds(code: string, filePath: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).map((m) => m.ruleId ?? 'fatal');
}

describe('層の決まり', () => {
  test('MGW-TC-0030-04 ゲームのルール（src/core）が DOM・時刻・乱数を使っていない', async () => {
    const core = 'src/core/probe.ts';
    // 使うとエラーになる
    expect(await ruleIds('export const w = document.title;\n', core)).toContain('no-restricted-globals');
    expect(await ruleIds('export const w = window.innerWidth;\n', core)).toContain('no-restricted-globals');
    expect(await ruleIds('export const t = performance.now();\n', core)).toContain('no-restricted-globals');
    expect(await ruleIds('export const t = Date.now();\n', core)).toContain('no-restricted-globals');
    expect(await ruleIds('export const t = new Date();\n', core)).toContain('no-restricted-globals');
    expect(await ruleIds('export const r = Math.random();\n', core)).toContain('no-restricted-properties');
    expect(await ruleIds("import { x } from '../render/canvas';\nexport const y = x;\n", core)).toContain('no-restricted-imports');
    // 純粋な計算はエラーにならない
    expect(await ruleIds("import { a } from './config';\nexport const b = Math.max(a, 1);\n", core)).toEqual([]);
    // ほかの層の決まり
    expect(await ruleIds("import { x } from '../app/loop';\nexport const y = x;\n", 'src/render/probe.ts')).toContain('no-restricted-imports');
    expect(await ruleIds("import { x } from '../core/game';\nexport const y = x;\n", 'src/storage/probe.ts')).toContain('no-restricted-imports');
    // core の外では DOM を使ってよい
    expect(await ruleIds('export const w = document.title;\n', 'src/app/probe.ts')).toEqual([]);
  });
});
