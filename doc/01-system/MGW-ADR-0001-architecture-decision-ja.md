---
id: MGW-ADR-0001
type: architecture-decision
title: 層の決まり（core は DOM・時刻・乱数に触れない）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - doc/specification.md (v1.3) §1.2、§10、§16
verified:
  by: tsuku3dayo
  at: 2026-10-26T15:48:01+09:00
---

# MGW-ADR-0001 層の決まり

## 状況

仕様書は、同じ入力の列からは必ず同じ展開とスコアになることを求めている（§1.2、§10）。また、ファイル構成を core・render・audio・storage に分けている（§16）。
ルールと物理を単体テストで確かめるには、ブラウザがなくても動く必要がある。

## 選択肢

1. 層を分け、core は純粋な TypeScript だけにする。決まりは ESLint で機械的に守る。
2. 層を分けるが、決まりは人の目で守る。
3. 層を分けず、ゲームのクラスに描画と音を持たせる。

## 決定

選択肢 1。

- `src/core/` は DOM・`window`・`document`、`Date`・`performance`、`Math.random`、ほかの層を import しない。
- `src/render/`・`src/audio/` は `src/core/` の型と関数だけを import する。状態を書き換えない。
- `src/storage/` はほかの層を import しない。
- 組み立てと時刻・入力の読み取りは `src/main.ts`（と main が使う `src/app/`）だけで行う。
- ESLint の `no-restricted-imports`・`no-restricted-globals`・`no-restricted-properties` で、上の決まりを破るとエラーにする。

## 理由

- core を Vitest だけで確かめられる（Canvas・音がなくてよい）。
- 時刻と乱数を core から締め出すと、決定性が作りの上で保たれる。
- 決まりを ESLint にすると、CI で破れに気づける。

## 影響

- 04 では、core の関数を「状態と入力を受け取り、新しい状態と音の計画を返す」形で設計する。
- 時刻は main が測り、ステップの回数として core に渡す（MGW-ADR-0002）。
