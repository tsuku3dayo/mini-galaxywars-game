---
id: MGW-TASK-0019
type: implementation-task
title: ランキングの書き出し・読み込み
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0006（v1.1）
  - MGW-TD-0006（v1.0）
  - MGW-TC-0027（v1.0）
verified: null
---

# MGW-TASK-0019 ランキングの書き出し・読み込み

* **workstream**：MGW-WS-0006
* **ブランチ**：`feat/TASK-0019-ranking-backup`
* **依存**：MGW-TASK-0018
* **実施記録**：attested-computation の同じ番号（0019）。作るのはこの TASK の PR

## やること

- ranking.ts の「書き出し」「読み込み」と確認

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0027-01 | MGW-US-0027 | 「書き出し」で、ランキングを JSON のファイルとして保存できる | 自動（E2E） |
| MGW-TC-0027-02 | MGW-US-0027 | 「読み込み」で、書き出した JSON からランキングを戻せる | 自動（E2E） |
| MGW-TC-0027-04 | MGW-US-0027 | 形の違う JSON や、ほかのアプリの JSON（`app` が `mini-galaxywars` でない）は読み込まず、今の記録を変えない | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0019、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
