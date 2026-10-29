---
id: MGW-TASK-0023
type: implementation-task
title: core：速さ・隕石の段・UFO を倒したときの流れ
status: stable
version: 1.1
updated: 2026-10-28
sources:
  - MGW-WS-0009（v1.2）
  - MGW-TD-0002（v1.5）
  - MGW-TC-0005（v1.1）
  - MGW-TC-0007（v1.1）
  - MGW-TC-0008（v1.1）
  - MGW-TC-0009（v1.2）
  - MGW-TC-0010（v1.2）
  - MGW-TC-0011（v1.1）
  - MGW-TC-0013（v1.1）
  - MGW-TC-0016（v1.2）
verified: null
---

# MGW-TASK-0023 core：速さ・隕石の段・UFO を倒したときの流れ

* **workstream**：MGW-WS-0009
* **ブランチ**：`feat/TASK-0023-core-balance`
* **依存**：MGW-TASK-0021
* **実施記録**：attested-computation の同じ番号（0023）。作るのはこの TASK の PR

## やること

- core/config.ts の速さ（1/4、光線 1/2）、隕石 11 段、`KILL_EFFECT_STEPS`・`UFO_FRAME_STEPS`
- game.ts：UFO を倒したらミサイルを消し、respawn（`waitReason = 'kill'`、1 秒）、`killEffect` を置く（MGW-TD-0002 §6.4）
- 速さ・段・流れが変わる単体テスト・E2E を新しい値で直す

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0005-02 | MGW-US-0005 | 領域が HUD 帯 0–48、UFO 通過領域 48–120、隕石往復領域 120–580、発射台待機領域 580–616 になっている（発射台の下に地面 616–618、左下の残機 620–636） | 自動（単体） |
| MGW-TC-0007-01 | MGW-US-0007 | 噴射しないときは、上昇 45 px/秒、横 30 px/秒で動き、バックファイアを描かない | 自動（単体） |
| MGW-TC-0007-02 | MGW-US-0007 | 噴射中（`Space` を押し続ける・マウスのボタンを押し続ける）は、上昇 70 px/秒、横 60 px/秒になる | 自動（単体） |
| MGW-TC-0008-02 | MGW-US-0008 | 速さは残りの機数で変わる：8 機 20 … 1 機 80 px/秒 | 自動（単体） |
| MGW-TC-0009-03 | MGW-US-0009 | 光線は 90 px/秒で落ちる | 自動（単体） |
| MGW-TC-0010-03 | MGW-US-0010 | 右へは 45 px/秒、左へは 30 px/秒で動く | 自動（単体） |
| MGW-TC-0010-04 | MGW-US-0010 | 隕石は 11 段で、最下段（y = 536）は発射前のミサイルの先端（y = 584）より上を通る | 自動（単体） |
| MGW-TC-0011-04 | MGW-US-0011 | ミサイルが UFO に当たると、UFO が壊れ、得点が入り、ミサイルは消える（1 回の発射で倒せるのは 1 機） | 自動（単体） |
| MGW-TC-0013-04 | MGW-US-0013 | 倒した UFO の位置に爆発が 0.4 秒出て、そのあと同じ位置に入った得点が、倒してから 1 秒まで出る | 自動（単体） |
| MGW-TC-0016-04 | MGW-US-0016 | 最上部を抜けたとき、または UFO を倒したとき（8 機目を除く）は、1 秒後に発射台が出て Ready に戻る。残機は減らない | 自動（単体） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0023、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
