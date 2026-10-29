---
id: MGW-TASK-0034
type: implementation-task
title: 表示とランキング：HUD の TIME・クリアの表示の 4 行・ランキングのタイム
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-WS-0012（v1.1）
  - MGW-TD-0003（v1.6）
  - MGW-TD-0004（v1.5）
  - MGW-TD-0006（v1.2）
  - MGW-TC-0013（v1.2）
  - MGW-TC-0015（v1.2）
  - MGW-TC-0017（v1.1）
  - MGW-TC-0025（v1.3）
  - MGW-TC-0026（v1.2）
  - MGW-TC-0027（v1.2）
verified: null
---

# MGW-TASK-0034 表示とランキング：HUD の TIME・クリアの表示の 4 行・ランキングのタイム

* **workstream**：MGW-WS-0012
* **ブランチ**：`feat/TASK-0034-time-bonus-view`
* **依存**：MGW-TASK-0033
* **実施記録**：attested-computation の同じ番号（0034）。作るのはこの TASK の PR

## やること

- render：残機の行の右に `TIME 095`（`timeText`）（MGW-TD-0003 §6）
- play.ts：クリアの表示に UFO・TIME・BONUS・TOTAL の 4 行（MGW-TD-0004 §5）
- main.ts・ranking-store.ts：登録するスコアは合計、クリアはタイム（`time`）も残す。読み込みでタイムを確かめる（MGW-TD-0006）
- ranking.ts：名前の下の行にクリアのタイム（`CLEAR · 95.7 秒 · 日時`）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0013-08 | MGW-US-0013 | 時間ボーナスの大きさが、遊んで納得できる | 手動（iPhone・PC） |
| MGW-TC-0015-07 | MGW-US-0015 | 左下の残機の行の右に、経過時間が `TIME 095` で出る。SCORE は UFO の得点だけ | 自動（単体） |
| MGW-TC-0015-08 | MGW-US-0015 | 同上 | 自動（E2E） |
| MGW-TC-0017-04 | MGW-US-0017 | クリアの表示の下に、UFO の得点・タイム・時間ボーナス・合計が出る。ゲームオーバーでは出ない | 自動（E2E） |
| MGW-TC-0017-05 | MGW-US-0017 | 同上 | 手動（iPhone・PC） |
| MGW-TC-0025-02 | MGW-US-0025 | 記録するのは、スコア（クリアは合計）・プレイヤー名・日時・結果と、クリアのタイム | 自動（単体） |
| MGW-TC-0026-01 | MGW-US-0026 | `#/ranking` に、順位・名前・スコアと、名前の下に結果・タイム・日時が出る | 自動（E2E） |
| MGW-TC-0027-07 | MGW-US-0027 | タイムが 0〜1,000,000 ミリ秒の整数でない記録や、クリアでない記録にタイムがあるファイルは読み込まない | 自動（単体） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0034、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
