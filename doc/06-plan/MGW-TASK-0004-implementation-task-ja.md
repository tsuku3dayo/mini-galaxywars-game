---
id: MGW-TASK-0004
type: implementation-task
title: 起動の復旧（boot.js）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0001（v1.6）
  - MGW-TD-0007（v1.5）
  - MGW-TC-0004（v1.0）
verified: null
---

# MGW-TASK-0004 起動の復旧（boot.js）

* **workstream**：MGW-WS-0001
* **ブランチ**：`feat/TASK-0004-boot-recovery`
* **依存**：MGW-TASK-0003
* **実施記録**：attested-computation の同じ番号（0004）。作るのはこの TASK の PR

## やること

- public/boot.js（8 秒、2 つのボタン、ランキングを消さない）
- main.ts から `__mgwBooted()` を呼ぶ

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0004-01 | MGW-US-0004 | 8 秒たってもアプリが起動しないと、復旧の画面が出る | 自動（E2E） |
| MGW-TC-0004-02 | MGW-US-0004 | 復旧の画面に「再読み込み」と「キャッシュを消して再読み込み」がある | 自動（E2E） |
| MGW-TC-0004-03 | MGW-US-0004 | 「キャッシュを消して再読み込み」をしても、ランキング（`galaxy-wars-scores`）は消えない | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0004、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
