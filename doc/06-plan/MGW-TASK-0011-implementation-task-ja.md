---
id: MGW-TASK-0011
type: implementation-task
title: HUD と終わりの表示
status: stable
version: 1.1
updated: 2026-10-28
sources:
  - MGW-WS-0003（v1.6）
  - MGW-TD-0003（v1.6）
  - MGW-TD-0004（v1.5）
  - MGW-TC-0015（v1.2）
  - MGW-TC-0017（v1.1）
  - MGW-TC-0019（v1.2）
verified: null
---

# MGW-TASK-0011 HUD と終わりの表示

* **workstream**：MGW-WS-0003
* **ブランチ**：`feat/TASK-0011-hud-messages`
* **依存**：MGW-TASK-0009、MGW-TASK-0010
* **実施記録**：attested-computation の同じ番号（0011）。作るのはこの TASK の PR

## やること

- render：HUD（SCORE・HIGH・残機のアイコン）
- app/screens/play.ts：READY・GOOD!!・STAGE CLEAR・GAME OVER・TITLE

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0015-01 | MGW-US-0015 | HUD 帯（y 0–48）に「SCORE」「HIGH」と残機が出る | 自動（E2E） |
| MGW-TC-0015-02 | MGW-US-0015 | スコアは 5 桁のゼロ詰め（例：`00150`）で出る | 自動（単体） |
| MGW-TC-0015-03 | MGW-US-0015 | 残機は、ミサイルではなく発射台のアイコンの数で出る | 手動（PC） |
| MGW-TC-0015-04 | MGW-US-0015 | HIGH は、ランキングの 1 位のスコアと、今のスコアの大きい方 | 自動（単体） |
| MGW-TC-0017-02 | MGW-US-0017 | UFO を 8 機すべて倒すと、クリアの表示が出てゲームが終わる | 自動（E2E） |
| MGW-TC-0019-02 | MGW-US-0019 | スコアが 1,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0011、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
