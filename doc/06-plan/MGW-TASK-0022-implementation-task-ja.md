---
id: MGW-TASK-0022
type: implementation-task
title: 増機の点数を 1,000 点にする
status: stable
version: 1.0
updated: 2026-10-28
sources:
  - MGW-WS-0008（v1.4）
  - MGW-TD-0002（v1.6）
  - MGW-TC-0019（v1.2）
  - MGW-TC-0023（v1.3）
verified: null
---

# MGW-TASK-0022 増機の点数を 1,000 点にする

* **workstream**：MGW-WS-0008
* **ブランチ**：`feat/TASK-0022-extend-score`
* **依存**：MGW-TASK-0011、MGW-TASK-0015
* **実施記録**：attested-computation の同じ番号（0022）。作るのはこの TASK の PR

## やること

- core/config.ts の `EXTEND_SCORE` を 1000 にする。scoring.ts のコメントを直す
- 増機のテスト（extend.test.ts・sound-plan.test.ts・e2e/hud.spec.ts）を新しい点数で確かめる（2,950 → 950 など）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0019-01 | MGW-US-0019 | スコアが 1,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | 自動（単体） |
| MGW-TC-0019-02 | MGW-US-0019 | スコアが 1,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | 自動（E2E） |
| MGW-TC-0019-03 | MGW-US-0019 | 増機は 1 回だけ | 自動（単体） |
| MGW-TC-0019-04 | MGW-US-0019 | 増えたときに増機音が鳴る（音は MGW-US-0023） | 自動（単体） |
| MGW-TC-0023-05 | MGW-US-0023 | 増機すると増機音（三角波 523 → 659 → 784 Hz のアルペジオ）が鳴る | 自動（単体） |
| MGW-TC-0023-06 | MGW-US-0023 | 増機すると増機音（三角波 523 → 659 → 784 Hz のアルペジオ）が鳴る | 手動（iPhone・PC） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0022、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
