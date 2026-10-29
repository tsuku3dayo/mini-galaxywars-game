---
id: MGW-TASK-0010
type: implementation-task
title: タイトル画面とルーティング
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0003（v1.3）
  - MGW-TD-0004（v1.2）
  - MGW-TC-0014（v1.2）
verified: null
---

# MGW-TASK-0010 タイトル画面とルーティング

* **workstream**：MGW-WS-0003
* **ブランチ**：`feat/TASK-0010-title-routing`
* **依存**：MGW-TASK-0008
* **実施記録**：attested-computation の同じ番号（0010）。作るのはこの TASK の PR

## やること

- app/screens/title.ts（MGW-GUI-0002）、router.ts の 3 つのハッシュ

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-01 | MGW-US-0014 | 起動すると `#/title` のタイトル画面に、アプリ名「ギャラクシーウォーズミニ」と「START」が出る | 自動（E2E） |
| MGW-TC-0014-02 | MGW-US-0014 | 「START」（または `Space`）で `#/play` に移り、発射前（Ready）から始まる | 自動（E2E） |
| MGW-TC-0014-03 | MGW-US-0014 | `#/title`・`#/play`・`#/ranking` のハッシュで画面が切り替わる | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0010、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
