---
id: MGW-TASK-0033
type: implementation-task
title: core：経過時間・時間ボーナス・合計
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-WS-0012（v1.0）
  - MGW-TD-0002（v1.6）
  - MGW-TC-0013（v1.2）
verified: null
---

# MGW-TASK-0033 core：経過時間・時間ボーナス・合計

* **workstream**：MGW-WS-0012
* **ブランチ**：`feat/TASK-0033-time-bonus-core`
* **依存**：MGW-TASK-0032
* **実施記録**：attested-computation の同じ番号（0033）。作るのはこの TASK の PR

## やること

- config.ts：`TIME_BONUS_BASE`（180）・`TIME_BONUS_PER_SEC`（5）
- types.ts・game.ts：`playSteps`（ステップの始まりが playing のときだけ 1 足す）、`timeBonus`。クリアのステップでボーナスを足す（増機には使わない）（MGW-TD-0002 §7.3）
- scoring.ts：`timeBonusOf(steps)`・`clearTimeMs(steps)`

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0013-06 | MGW-US-0013 | クリアしたとき、時間ボーナス max(0, 180 − 経過秒（切り捨て）) × 5 が UFO の得点に足され、合計がスコアになる。ゲームオーバーでは 0 | 自動（単体） |
| MGW-TC-0013-07 | MGW-US-0013 | 経過時間は、ミサイルが飛んでいる間（Playing）だけ数える。発射前・待ち・出撃待ち・一時停止の間は数えない | 自動（単体） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- attested-computation（番号 0033、draft）に自動テストの結果を書き、同じ PR に入れた。
