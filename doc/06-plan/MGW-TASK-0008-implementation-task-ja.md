---
id: MGW-TASK-0008
type: implementation-task
title: 描画と PC でのプレイ画面
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0002（v1.0）
  - MGW-TD-0003（v1.0）
  - MGW-TD-0004（v1.0）
  - MGW-TC-0005（v1.0）
  - MGW-TC-0006（v1.0）
  - MGW-TC-0007（v1.0）
  - MGW-TC-0009（v1.0）
  - MGW-TC-0011（v1.0）
  - MGW-TC-0030（v1.0）
verified: null
---

# MGW-TASK-0008 描画と PC でのプレイ画面

* **workstream**：MGW-WS-0002
* **ブランチ**：`feat/TASK-0008-render-pc-play`
* **依存**：MGW-TASK-0004、MGW-TASK-0007
* **実施記録**：attested-computation の同じ番号（0008）。作るのはこの TASK の PR

## やること

- render：canvas.ts・sprites.ts（ドット絵・フォント）
- app：layout.ts、loop.ts、input.ts（キー・マウス）、router.ts の `#/play`、debug.ts の `__mgw`・デバッグ表示

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0005-01 | MGW-US-0005 | 論理座標 480 × 640 で計算し、画面には縦横比 3:4 を保って拡大・縮小して表示する | 自動（E2E） |
| MGW-TC-0006-03 | MGW-US-0006 | `←` `→`・`A` `D`・マウスの移動で、発射台がミサイルといっしょに横に動き、画面の端で止まる | 自動（E2E） |
| MGW-TC-0006-05 | MGW-US-0006 | `Space` かクリックで発射し、ミサイルが上昇を始める | 自動（E2E） |
| MGW-TC-0007-04 | MGW-US-0007 | 噴射中だけ、ミサイルの後ろにバックファイアを描く | 手動（PC） |
| MGW-TC-0009-05 | MGW-US-0009 | 光線は波の形（ニョロニョロ線）で描く | 手動（PC） |
| MGW-TC-0011-03 | MGW-US-0011 | 発射前のミサイルの先端に隕石が触れてもミスになる | 自動（E2E） |
| MGW-TC-0030-05 | MGW-US-0030 | iPhone の実機で、ゲームの時間と実際の時間がずれない（デバッグ表示で、1 秒あたり 120 ステップ進むことを見る） | 手動（iPhone） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0008、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
