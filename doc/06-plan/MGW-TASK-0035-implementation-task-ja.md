---
id: MGW-TASK-0035
type: implementation-task
title: 弾の絵・隕石の尾の 2 コマ・出撃の位置・名前の入力欄の幅
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-WS-0013（v1.1）
  - MGW-TD-0002（v1.7）
  - MGW-TD-0003（v1.8）
  - MGW-TD-0004（v1.7）
  - MGW-TC-0009（v1.3）
  - MGW-TC-0010（v1.3）
  - MGW-TC-0016（v1.3）
  - MGW-TC-0025（v1.3）
verified: null
---

# MGW-TASK-0035 弾の絵・隕石の尾の 2 コマ・出撃の位置・名前の入力欄の幅

* **workstream**：MGW-WS-0013
* **ブランチ**：`feat/TASK-0035-sprites-deploy`
* **依存**：MGW-TASK-0034
* **実施記録**：attested-computation の同じ番号（0035）。作るのはこの TASK の PR

## やること

- sprites.ts：光線の 2 コマをオーナーの画像のとおりに（細い波と、それを左右に裏返した波。16 行）、隕石の尾の 2 コマ（`meteorTrailFrame`）（MGW-TD-0003 §3）
- canvas.ts：尾を UFO と同じ時に切り替えて描く
- game.ts：出撃のとき、`targetX` があればその x（24〜456）、なければ 240（MGW-TD-0002 §6 の 5）
- input.ts：出撃・発射のタップの位置を `targetX` にする（MGW-TD-0004 §4）
- style.css：名前の入力欄を全角 8 文字が見える幅に

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0009-05 | MGW-US-0009 | 光線の 2 コマ（細い波と、それを左右に裏返した波） | 手動（PC） |
| MGW-TC-0009-06 | MGW-US-0009 | 同上 | 自動（単体） |
| MGW-TC-0010-09 | MGW-US-0010 | 隕石の尾の 2 コマ | 自動（単体） |
| MGW-TC-0010-10 | MGW-US-0010 | 同上 | 手動（PC） |
| MGW-TC-0016-09 | MGW-US-0016 | 出撃の位置（タップ・クリックした x、Space はマウスの x か 240） | 自動（単体） |
| MGW-TC-0016-10 | MGW-US-0016 | 同上 | 自動（E2E） |
| MGW-TC-0016-11 | MGW-US-0016 | 同上 | 手動（iPhone） |
| MGW-TC-0025-09 | MGW-US-0025 | 名前の入力欄に、日本語の名前 8 文字が全部見える | 自動（E2E） |
| MGW-TC-0025-10 | MGW-US-0025 | 同上 | 手動（iPhone・PC） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0035、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
