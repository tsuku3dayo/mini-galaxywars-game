---
id: MGW-TASK-0017
type: implementation-task
title: ランキングの保存（ranking-store）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0006（v1.3）
  - MGW-TD-0006（v1.1）
  - MGW-TC-0025（v1.1）
  - MGW-TC-0027（v1.1）
verified: null
---

# MGW-TASK-0017 ランキングの保存（ranking-store）

* **workstream**：MGW-WS-0006
* **ブランチ**：`feat/TASK-0017-ranking-store`
* **依存**：MGW-TASK-0001
* **実施記録**：attested-computation の同じ番号（0017）。作るのはこの TASK の PR

## やること

- storage/ranking-store.ts（保存の形・並び・順位・検査・名前）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0025-02 | MGW-US-0025 | 記録するのは、スコア・プレイヤー名・日時 | 自動（単体） |
| MGW-TC-0025-03 | MGW-US-0025 | localStorage の `galaxy-wars-scores` に、スコアの高い順で上位 10 件だけを残す | 自動（単体） |
| MGW-TC-0027-03 | MGW-US-0027 | 形の違う JSON や、ほかのアプリの JSON（`app` が `mini-galaxywars` でない）は読み込まず、今の記録を変えない | 自動（単体） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0017、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
