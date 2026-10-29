---
id: MGW-TASK-0031
type: implementation-task
title: 効果音のオン・オフ
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-WS-0010（v1.0）
  - MGW-TD-0004（v1.2）
  - MGW-TD-0005（v1.2）
  - MGW-TD-0006（v1.1）
  - MGW-TC-0014（v1.2）
  - MGW-TC-0023（v1.3）
  - MGW-TC-0034（v1.0）
verified: null
---

# MGW-TASK-0031 効果音のオン・オフ

* **workstream**：MGW-WS-0010
* **ブランチ**：`feat/TASK-0031-sound-toggle`
* **依存**：MGW-TASK-0030
* **実施記録**：attested-computation の同じ番号（0031）。作るのはこの TASK の PR

## やること

- settings-store.ts：`sound`（`load`・`save(patch)`。前からの設定はオン）（MGW-TD-0006 §2）
- synthesizer.ts：`setEnabled`（オフで鳴らさない・噴射音をすぐ止める）（MGW-TD-0005）
- sound-toggle.ts：タイトル画面とボタンの段の効果音のボタン（文言・`aria-pressed`・`data-sound`、押したらフォーカスを外す、ゲームの入力にしない）（MGW-TD-0004 §2）
- タイトル画面のボタンを iPhone SE の高さで枠に収める（MGW-GUI-0002）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-04 | MGW-US-0014 | タイトル画面に、START・RANKING・SETTINGS のほか、CREDITS・ランキング消去・効果音のボタンが出て、iPhone SE の高さでもゲーム画面の枠に収まる | 自動（E2E） |
| MGW-TC-0023-10 | MGW-US-0023 | 上の音は、効果音がオンのときだけ鳴る | 自動（単体） |
| MGW-TC-0034-01 | MGW-US-0034 | タイトル画面とプレイ画面に、効果音のボタンがある。プレイ画面では、操作空間の下の右 | 自動（E2E） |
| MGW-TC-0034-02 | MGW-US-0034 | 押すたびにオンとオフが入れ替わり、2 つのボタンの表示がそろう | 自動（E2E） |
| MGW-TC-0034-03 | MGW-US-0034 | オフのときは、どの効果音も鳴らない。噴射音が鳴っているときに押すと、すぐ止まる | 自動（単体） |
| MGW-TC-0034-04 | MGW-US-0034 | 同上 | 手動（iPhone・PC） |
| MGW-TC-0034-05 | MGW-US-0034 | 設定は端末に保存され、開き直しても同じ。初めはオン。前からの設定はオンとして読み、表示方式は変わらない | 自動（単体） |
| MGW-TC-0034-06 | MGW-US-0034 | 同上 | 自動（E2E） |
| MGW-TC-0034-07 | MGW-US-0034 | プレイ中に押しても、ゲームは止まらず、発射・移動にもならない | 自動（E2E） |
| MGW-TC-0034-08 | MGW-US-0034 | オフで始めてから iPhone でオンに戻すと、すぐ鳴る | 手動（iPhone） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0031、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
