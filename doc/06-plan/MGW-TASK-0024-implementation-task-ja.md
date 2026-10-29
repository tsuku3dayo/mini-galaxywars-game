---
id: MGW-TASK-0024
type: implementation-task
title: 描画：地面・残機・倒したときの表示・UFO の 2 コマ・隕石の尾
status: stable
version: 1.0
updated: 2026-10-28
sources:
  - MGW-WS-0009（v1.4）
  - MGW-TD-0003（v1.7）
  - MGW-TC-0008（v1.1）
  - MGW-TC-0010（v1.3）
  - MGW-TC-0013（v1.2）
  - MGW-TC-0015（v1.2）
  - MGW-TC-0019（v1.2）
verified: null
---

# MGW-TASK-0024 描画：地面・残機・倒したときの表示・UFO の 2 コマ・隕石の尾

* **workstream**：MGW-WS-0009
* **ブランチ**：`feat/TASK-0024-render-ground-lives`
* **依存**：MGW-TASK-0023
* **実施記録**：attested-computation の同じ番号（0024）。作るのはこの TASK の PR

## やること

- render/sprites.ts：UFO の 2 コマ、隕石の尾
- render/hud.ts・canvas.ts：地面、左下の残機（数と控えのアイコン）、`killEffect` の爆発と得点（MGW-TD-0003 §6）
- HUD の右上の残機をなくす

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0008-03 | MGW-US-0008 | UFO は 2 コマの絵を 0.25 秒ごとに切り替え、羽ばたくように見える | 自動（単体） |
| MGW-TC-0008-04 | MGW-US-0008 | UFO は 2 コマの絵を 0.25 秒ごとに切り替え、羽ばたくように見える | 手動（PC） |
| MGW-TC-0010-05 | MGW-US-0010 | 隕石には、進む向きの後ろに尾が付き、向きが分かる | 自動（単体） |
| MGW-TC-0010-06 | MGW-US-0010 | 隕石には、進む向きの後ろに尾が付き、向きが分かる | 手動（PC） |
| MGW-TC-0013-05 | MGW-US-0013 | 倒した UFO の位置に爆発が 0.4 秒出て、そのあと同じ位置に入った得点が、倒してから 1 秒まで出る | 手動（PC） |
| MGW-TC-0015-01 | MGW-US-0015 | HUD 帯（y 0–48）に「SCORE」「HIGH」が出て、残機は画面の左下（地面の下）に出る | 自動（E2E） |
| MGW-TC-0015-03 | MGW-US-0015 | 残機は、数と控えの発射台のアイコンで出る | 手動（PC） |
| MGW-TC-0015-05 | MGW-US-0015 | 残機は、数（画面に出ている 1 基を含む）と、控えの発射台のアイコン（数 − 1 個）で出る | 自動（単体） |
| MGW-TC-0015-06 | MGW-US-0015 | 発射台の下に、地面の横線が出る | 手動（PC） |
| MGW-TC-0019-02 | MGW-US-0019 | スコアが 1,000 点に届くと、残機が 1 基増え、左下の残機の数とアイコンが 1 つ増える | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0024、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
