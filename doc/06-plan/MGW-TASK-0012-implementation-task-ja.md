---
id: MGW-TASK-0012
type: implementation-task
title: 一時停止
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0003（v1.6）
  - MGW-TD-0002（v1.7）
  - MGW-TD-0004（v1.5）
  - MGW-TC-0018（v1.1）
verified: null
---

# MGW-TASK-0012 一時停止

* **workstream**：MGW-WS-0003
* **ブランチ**：`feat/TASK-0012-pause`
* **依存**：MGW-TASK-0011
* **実施記録**：attested-computation の同じ番号（0012）。作るのはこの TASK の PR

## やること

- Pause・PAUSE・RESUME、`P`・`Esc`、タブが隠れたとき

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0018-01 | MGW-US-0018 | `P`・`Esc`・「Pause」ボタンで一時停止し、もう一度押すと再開する | 自動（E2E） |
| MGW-TC-0018-02 | MGW-US-0018 | タブが隠れたり、アプリが裏に回ったりすると、一時停止になる | 自動（E2E） |
| MGW-TC-0018-03 | MGW-US-0018 | 再開すると、発射前に止めたときは Ready、上昇中に止めたときは Playing に戻る | 自動（単体） |
| MGW-TC-0018-04 | MGW-US-0018 | 一時停止の間は、ゲームの時間（永久パターン防止のタイマーを含む）が進まない | 自動（単体） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0012、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
