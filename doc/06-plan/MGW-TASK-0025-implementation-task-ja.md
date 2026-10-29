---
id: MGW-TASK-0025
type: implementation-task
title: ミサイルの噴射音
status: stable
version: 1.0
updated: 2026-10-28
sources:
  - MGW-WS-0009（v1.3）
  - MGW-TD-0005（v1.2）
  - MGW-TC-0023（v1.3）
verified: null
---

# MGW-TASK-0025 ミサイルの噴射音

* **workstream**：MGW-WS-0009
* **ブランチ**：`feat/TASK-0025-jet-sound`
* **依存**：MGW-TASK-0023
* **実施記録**：attested-computation の同じ番号（0025）。作るのはこの TASK の PR

## やること

- audio/synthesizer.ts：`jetOn`〜`jetOff` をノイズの「シュー」にする（MGW-TD-0005）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0023-01 | MGW-US-0023 | 加速噴射の間、ミサイルの噴射音（ノイズの「シュー」という音）が鳴る。噴射しないときは鳴らない | 自動（単体） |
| MGW-TC-0023-02 | MGW-US-0023 | 加速噴射の間、ミサイルの噴射音（ノイズの「シュー」という音）が鳴る。噴射しないときは鳴らない | 手動（iPhone・PC） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0025、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
