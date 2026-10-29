---
id: MGW-TASK-0003
type: implementation-task
title: PWA（マニフェスト・オフライン・「更新」ボタン）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0001（v1.5）
  - MGW-TD-0007（v1.5）
  - MGW-TD-0004（v1.4）
  - MGW-TC-0002（v1.1）
  - MGW-TC-0003（v1.0）
verified: null
---

# MGW-TASK-0003 PWA（マニフェスト・オフライン・「更新」ボタン）

* **workstream**：MGW-WS-0001
* **ブランチ**：`feat/TASK-0003-pwa`
* **依存**：MGW-TASK-0002
* **実施記録**：attested-computation の同じ番号（0003）。作るのはこの TASK の PR

## やること

- vite-plugin-pwa の設定（MGW-TD-0007 §1）とアイコン
- app/pwa.ts と更新の案内（MGW-GUI-0007 §1）
- check-dist.mjs に外部 URL・マニフェスト・Service Worker の確認を足す
- debug.ts の骨組み（data 属性、`?debug=1`、`simulateUpdate`）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0002-01 | MGW-US-0002 | 一度開いたあと、ネットワークを切っても起動して遊べる | 自動（E2E） |
| MGW-TC-0002-02 | MGW-US-0002 | iPhone で機内モードにして、ホーム画面のアプリから起動して遊べる | 手動（iPhone） |
| MGW-TC-0002-03 | MGW-US-0002 | 公開するファイルに外部の URL（CDN・Web フォントなど）がない | 自動（dist の検査） |
| MGW-TC-0002-04 | MGW-US-0002 | マニフェストの `name` が「ギャラクシーウォーズミニ」で、Service Worker の範囲が `/mini-galaxywars-game/` | 自動（dist の検査） |
| MGW-TC-0002-05 | MGW-US-0002 | iPhone のホーム画面に追加でき、アプリの名前が切れない | 手動（iPhone） |
| MGW-TC-0003-01 | MGW-US-0003 | 新しい版が届くと、タイトル画面とランキング画面に「更新」ボタンが出る | 自動（E2E） |
| MGW-TC-0003-02 | MGW-US-0003 | 「更新」を押すと、新しい版に切り替わって再読み込みされる | 自動（E2E） |
| MGW-TC-0003-03 | MGW-US-0003 | プレイ中（#/play）は「更新」を出さず、版も切り替わらない | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0003、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
