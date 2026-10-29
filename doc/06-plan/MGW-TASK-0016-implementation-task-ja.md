---
id: MGW-TASK-0016
type: implementation-task
title: iPhone で音を有効にする
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0005（v1.5）
  - MGW-TD-0004（v1.4）
  - MGW-TD-0005（v1.2）
  - MGW-TC-0024（v1.0）
verified: null
---

# MGW-TASK-0016 iPhone で音を有効にする

* **workstream**：MGW-WS-0005
* **ブランチ**：`feat/TASK-0016-audio-unlock`
* **依存**：MGW-TASK-0015
* **実施記録**：attested-computation の同じ番号（0016）。作るのはこの TASK の PR

## やること

- START で `unlock()`、`data-audio`

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0024-01 | MGW-US-0024 | iPhone で、最初のタッチ（「START」など）のあとから音が鳴る | 手動（iPhone） |
| MGW-TC-0024-02 | MGW-US-0024 | 音が鳴らせない状態でも、ゲームは止まらずに動く | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0016、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
