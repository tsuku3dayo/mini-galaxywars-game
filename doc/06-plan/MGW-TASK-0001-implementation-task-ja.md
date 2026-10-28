---
id: MGW-TASK-0001
type: implementation-task
title: プロジェクトの骨組みと CI
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0001（v1.2）
  - MGW-TD-0001（v1.0）
  - MGW-TD-0007（v1.4）
  - MGW-TC-0001（v1.0）
  - MGW-TC-0030（v1.0）
verified: null
---

# MGW-TASK-0001 プロジェクトの骨組みと CI

* **workstream**：MGW-WS-0001
* **ブランチ**：`feat/TASK-0001-scaffold`
* **依存**：なし
* **実施記録**：attested-computation の同じ番号（0001）。作るのはこの TASK の PR

## やること

- package.json（MGW-TS-0001 の道具と npm のスクリプト）、tsconfig.json、vite.config.ts（base）
- eslint.config.js（層の決まり。MGW-TD-0001 §4）と、決まりを確かめる単体テスト
- vitest・playwright.config.ts（3 つの project）
- index.html の骨組み、src/main.ts（タイトルの仮の表示）
- scripts/check-dist.mjs の骨組み（base の確認）
- .github/workflows/ci.yml に verify と e2e のジョブ

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0001-02 | MGW-US-0001 | PR では verify と E2E が CI で動き、失敗するとマージの前に分かる | 手動（CI） |
| MGW-TC-0030-04 | MGW-US-0030 | ゲームのルール（src/core）が DOM・時刻・乱数を使っていない | 自動（単体：Lint の決まり） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0001、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
