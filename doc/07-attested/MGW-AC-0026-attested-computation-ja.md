---
id: MGW-AC-0026
type: attested-computation
title: 名前「銀河戦争ミニ」とタイトル画面の確認
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-TASK-0026（v1.0）
  - MGW-TC-0002（v1.1）
  - MGW-TC-0014（v1.4）
verified:
  by: tsuku3dayo
  at: 2026-10-29T10:09:17+09:00
---

# MGW-AC-0026 名前「銀河戦争ミニ」とタイトル画面の確認

* **TASK**：MGW-TASK-0026（ブランチ `feat/TASK-0026-app-name`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0002-04 | マニフェストの `name` が「銀河戦争ミニ」で、Service Worker の範囲が `/mini-galaxywars-game/` | OK | `npm run check:dist`（`scripts/check-dist.mjs`）：`dist/manifest.webmanifest` の `name`・`short_name` がどちらも「銀河戦争ミニ」、`scope`・`start_url` が `/mini-galaxywars-game/`。エラー 0 件 |
| MGW-TC-0014-01 | 起動すると `#/title` のタイトル画面に、アプリ名「銀河戦争ミニ」と「START」が出る | OK | `✓` › e2e\title.spec.ts › MGW-TC-0014-01（3 つの project）。アプリ名が「銀河戦争ミニ」、ページの `<title>` も「銀河戦争ミニ」。「原作」「非公式」の文字はタイトル画面に出ない。START・RANKING・HIGH・操作の案内が、ゲーム画面の枠の中に収まる |

そのほか：`e2e/offline.spec.ts`（MGW-TC-0002-01）のアプリ名も「銀河戦争ミニ」で確かめる。`index.html` の `apple-mobile-web-app-title` も「銀河戦争ミニ」にした。

単体テストの合計：`Tests 83 passed (83)`。E2E の合計：`118 passed`、`17 skipped`。`npm run verify` も通った。

画面：iPhone SE の幅で、タイトル画面（HIGH・銀河戦争ミニ・UFO・START・RANKING・SETTINGS・操作の案内）のスクリーンショットを見た。原作の表記を消したので、下に余白ができた。WS-0007 のふりかえりで持ち越した「タイトル画面も iPhone SE の高さで枠に収まることを E2E で確かめる」は、MGW-TC-0014-01 の枠の判定（`iphonese-webkit` でも通る）で確かめられている。

## 2. 手動の確認（WS-0009 の終わり、2026-10-29、オーナー、iPhone 11）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0002-05 | Safari の共有 →「ホーム画面に追加」。アイコンの下の名前が「銀河戦争ミニ」で切れていない | OK（iPhone 11 の Safari から追加し直して確かめた） |

## 3. 設計と違う作りにしたこと

なし。MGW-TD-0007 v1.4・MGW-GUI-0002 v1.1 のとおり。原作の表記は、リリースで作る README に書く（MGW-ADR-0007 v1.2）。

## 4. 確認できなかったこと

- すでにホーム画面に置いてある「GWミニ」は、更新しても名前が変わらないことがある（iPhone はホーム画面に追加したときの名前を使う）。MGW-TC-0002-05 は、ホーム画面に追加し直して確かめる。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
