---
id: MGW-TASK-0005
type: implementation-task
title: core の土台（定数・状態・ステップ・決定性）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0002（v1.0）
  - MGW-TD-0002（v1.1）
  - MGW-TC-0005（v1.0）
  - MGW-TC-0030（v1.0）
verified: null
---

# MGW-TASK-0005 core の土台（定数・状態・ステップ・決定性）

* **workstream**：MGW-WS-0002
* **ブランチ**：`feat/TASK-0005-core-foundation`
* **依存**：MGW-TASK-0001
* **実施記録**：attested-computation の同じ番号（0005）。作るのはこの TASK の PR

## やること

- core/config.ts・types.ts・timestep.ts
- game.ts の newGame・step の骨組み・togglePause
- 同じ入力の列から同じ結果になることのテスト

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0005-02 | MGW-US-0005 | 領域が HUD 帯 0–48、UFO 通過領域 48–120、隕石往復領域 120–580、発射台待機領域 580–612 になっている | 自動（単体） |
| MGW-TC-0030-01 | MGW-US-0030 | 同じ入力の列を 2 回流すと、状態とスコアが毎回まったく同じになる | 自動（単体） |
| MGW-TC-0030-02 | MGW-US-0030 | 物理は 1/120 秒の固定ステップで進み、1 回の描画で進めるのは最大 12 ステップ | 自動（単体） |
| MGW-TC-0030-03 | MGW-US-0030 | 画面の更新が 60 Hz でも 120 Hz でも、同じ入力の列なら同じ結果になる | 自動（単体） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0005、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
