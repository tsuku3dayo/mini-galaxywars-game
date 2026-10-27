---
id: MGW-AC-0004
type: attested-computation
title: 起動の復旧（boot.js）の確認
status: draft
version: 1.0
updated: 2026-10-27
sources:
  - MGW-TASK-0004（v1.0）
  - MGW-TC-0004（v1.0）
verified: null
---

# MGW-AC-0004 起動の復旧（boot.js）の確認

* **TASK**：MGW-TASK-0004（ブランチ `feat/TASK-0004-boot-recovery`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Playwright 1.64.1（Chromium・WebKit）

## 1. 自動テストの結果

起動の失敗は、アプリ本体（`assets/*.js`）の読み込みを止めて作った。8 秒は `page.clock` を止めたうえで `runFor` で進めた。

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0004-01 | 8 秒たってもアプリが起動しないと、復旧の画面が出る | OK（3 つの project） | `✓ [pc-chromium]`・`✓ [iphone11-webkit]`・`✓ [iphonese-webkit]` › e2e\boot-recovery.spec.ts › MGW-TC-0004-01。7.9 秒では出ず、8 秒を過ぎると出て `#app` が隠れる。アプリが起動したときは、10 秒たっても出ないことも確かめた |
| MGW-TC-0004-02 | 復旧の画面に「再読み込み」と「キャッシュを消して再読み込み」がある | OK（3 つの project） | 同じく MGW-TC-0004-02。「再読み込み」を押すと読み込み直されることも確かめた |
| MGW-TC-0004-03 | 「キャッシュを消して再読み込み」をしても、ランキング（`galaxy-wars-scores`）は消えない | OK（3 つの project） | 同じく MGW-TC-0004-03。読み込み直したあとも `galaxy-wars-scores` が同じ値で残る。キャッシュは `mini-galaxywars` で始まるものだけが消え、ほかの名前のキャッシュは残る |

E2E の合計：`22 passed`、`2 skipped`（15.5 秒）。boot-recovery.spec.ts を `--repeat-each=5` で動かして `60 passed`（毎回同じ結果になる）。`npm run verify` も通った（`check:dist` で `boot.js` があり、アプリ本体より先に読むことも確かめる）。

画面：iPhone 11・iPhone SE の幅（WebKit）で復旧の画面を表示し、見出し・2 つのボタン・補足がはみ出さずに収まることを確かめた。

## 2. 手動の確認

この TASK の確認 ID には手動のものはない。

## 3. 設計と違う作りにしたこと

- `scripts/check-dist.mjs` で、`boot.js` があることに加えて、`index.html` がアプリ本体（`type="module"`）より先に読むことも確かめるようにした（MGW-TD-0007 §3 の「モジュールより先に読む」を守るため）。
- `eslint.config.js` で `public/**/*.js` を `ecmaVersion: 5` にした（MGW-TD-0007 §3 の「ES5 の範囲で書く」を lint で確かめるため）。

## 4. 確認できなかったこと

- 「キャッシュを消して再読み込み」で Service Worker の登録が消えることは、E2E では確かめていない。アプリ本体の読み込みを止めるために、この spec では Service Worker を使わないため（Service Worker が受け持つ通信は `page.route` を通らない）。コードでは scope が `/mini-galaxywars-game/` の登録だけを `unregister()` する。
