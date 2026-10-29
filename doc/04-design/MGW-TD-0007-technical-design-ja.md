---
id: MGW-TD-0007
type: technical-design
title: PWA・起動の復旧・ビルド・CI・Lint の設計
status: stable
version: 1.5
updated: 2026-10-29
sources:
  - MGW-TD-0001（v1.1）
  - MGW-TS-0001（v1.1）
  - MGW-ADR-0003（v1.1）
  - MGW-ADR-0004（v1.1）
  - MGW-ADR-0005（v1.1）
  - MGW-ADR-0006（v1.0）
  - MGW-ADR-0007（v1.2）
  - MGW-GUI-0001（v1.5）
  - MGW-GUI-0007（v1.0）
  - MGW-US-0001（v1.0）
  - MGW-US-0002（v1.1）
  - MGW-US-0003（v1.0）
  - MGW-US-0004（v1.0）
  - MGW-US-0022（v1.0）
  - doc/specification.md (v1.10) §13〜§15、§23〜§25
verified: null
---

# MGW-TD-0007 PWA・起動の復旧・ビルド・CI・Lint の設計

## 1. ビルド（`vite.config.ts`）

- `base: '/mini-galaxywars-game/'`。
- vite-plugin-pwa：

| 設定 | 値 |
| :--- | :--- |
| `registerType` | `'prompt'`（MGW-ADR-0004） |
| `workbox.cacheId` | `'mini-galaxywars'`（MGW-ADR-0005） |
| `workbox.globPatterns` | `['**/*.{html,js,css,png,svg,webmanifest}']` |
| `manifest.name`・`short_name` | `銀河戦争ミニ`・`銀河戦争ミニ`（MGW-GUI-0001 §6、仕様書 v1.6） |
| `manifest.display`・`orientation` | `standalone`・`portrait` |
| `manifest.start_url`・`scope` | `/mini-galaxywars-game/` |
| `manifest.icons` | 192・512 の PNG（`public/icons/`）、iPhone 用に 180 の `apple-touch-icon` |

- `index.html` の head：`viewport-fit=cover`、`apple-mobile-web-app-capable`、`apple-mobile-web-app-status-bar-style = black-translucent`、`apple-mobile-web-app-title = 銀河戦争ミニ`。
- 03 の試作は、公開の workflow で `dist/prototype/` に写して、いっしょに公開し続ける。

## 2. 更新（`app/pwa.ts`）

- `virtual:pwa-register` の `registerSW({ onNeedRefresh })` を使う。`onNeedRefresh` で「新しい版が待っている」印を立てる。
- 印が立っていて、画面がタイトルかランキングのときだけ、更新の案内を出す（MGW-GUI-0007）。
- 「更新」で `updateSW(true)`（待っている Service Worker に切り替えて再読み込み）。
- 新しい版を確かめるのは、読み込んだとき（ブラウザに任せず、登録の直後にも `registration.update()`。iPhone のホーム画面のアプリは、読み込んだだけでは確かめないことがあったため）と、画面が見えたとき（`visibilitychange` で `visible`、オンラインのとき `registration.update()`）。iPhone のホーム画面のアプリは閉じずに前に戻ってくることが多く、そのときは読み込み直さないため。
- 古い版の画面がすべて閉じられると、待っていた版は次に開いたときに自動で使われる（Service Worker の決まり）。このときは案内を出さずに新しい版で動く。

## 3. 起動の復旧（`public/boot.js`）

- `index.html` の head で、モジュールより先に普通の `<script src="boot.js">` として読む。
- 8 秒のタイマーを始める。`main.ts` は画面を出したら `window.__mgwBooted()` を呼び、タイマーを止める。
- 8 秒たったら、`#app` の代わりに復旧の画面（MGW-GUI-0007 §2）を出す。
  - 再読み込み：`location.reload()`。
  - キャッシュを消して再読み込み：`navigator.serviceWorker.getRegistrations()` のうち scope が `/mini-galaxywars-game/` のものを `unregister()`、`caches.keys()` のうち `mini-galaxywars` で始まるものを消して、`location.reload()`。localStorage には触れない。
- ES5 の範囲で書く（古い端末でも、このファイルだけは動くように）。

## 4. dist の検査（`scripts/check-dist.mjs`）

| 確かめること | US |
| :--- | :--- |
| `dist/` の HTML・JS・CSS・マニフェストに、`http://`・`https://` で始まる外部の URL がない（`https://tsuku3dayo.github.io/` と XML の名前空間を除く） | MGW-US-0002 |
| `manifest.webmanifest` の `name`・`short_name`・`scope`・`start_url` | MGW-US-0002 |
| `sw.js` があり、キャッシュの名前に `mini-galaxywars` を含む | MGW-US-0002 |
| `index.html` の資源の参照が `/mini-galaxywars-game/` で始まる | MGW-US-0001 |
| `boot.js` がある | MGW-US-0004 |
| `.mp3`・`.wav`・`.ogg` などの音のファイルがない | MGW-US-0023 |

## 5. npm のスクリプト

MGW-TS-0001 §3 のとおり。`verify` は `lint` → `test` → `build` → `check:dist` → `check:docs`。

## 6. CI（`.github/workflows/`）

| workflow | きっかけ | ジョブ |
| :--- | :--- | :--- |
| `ci.yml` | PR・main への push | `verify`（Node 24、`npm ci`、`npm run verify`）、`e2e`（Playwright のコンテナ `mcr.microsoft.com/playwright:v<@playwright/test と同じ版>-noble` の中で、`npm run build` のあと `npm run test:e2e`。ブラウザを入れる手順が終わらないことがあったため、入れずに済むコンテナを使う） |
| `pages.yml` | main への push | `verify`・`e2e` と同じ確認のあと、`dist/` と `prototype/` を GitHub Pages に公開 |

- 今の `pages.yml`（試作だけを公開）は、土台の WS でこの形に置き換える。

## 7. E2E（`playwright.config.ts`）

| project | 端末 | 使い道 |
| :--- | :--- | :--- |
| `pc-chromium` | Desktop Chrome（1280 × 800） | PC の操作（キー・マウス）、画面、保存 |
| `iphone11-webkit` | `devices['iPhone 11']` | タッチ、操作空間、大きさ |
| `iphonese-webkit` | `devices['iPhone SE (3rd gen)']`（375 × 667） | はみ出さないこと（MGW-US-0022）。仕様書 v1.8 で、第 1 世代（320 × 568）から MGW-GUI-0001 §1 の基準の大きさに替えた |

- `webServer` は `npm run preview`（`vite preview`、base 付き）。
- 文字の幅に頼るテストは書かない（CI と手元でフォントが違うため）。

## 8. Lint（`eslint.config.js`）

- `@eslint/js` の推奨と `typescript-eslint` の推奨（型を使わないもの）。型を使う規則は、ソースの断片を `lintText` で lint して層の決まりを確かめる単体テスト（MGW-TC-0030-04）では使えないため、入れない。型の誤りは `tsc --noEmit`（`npm run build`）で見つける。
- 層の決まり（MGW-TD-0001 §4）を `no-restricted-globals`・`no-restricted-properties`・`no-restricted-imports` で書く。
- `tsconfig.json`：`strict: true`、`noUncheckedIndexedAccess: true`、`noUnusedLocals`・`noUnusedParameters`、`verbatimModuleSyntax`、`target: ES2022`。

## 9. 改訂履歴

| 版 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-10-26 | 初版 |
| 1.1 | 2026-10-26 | §6：e2e は Playwright のコンテナで動かす。§8：typescript-eslint は型を使わない推奨にした（どちらも MGW-TASK-0001 の実装に合わせる） |
| 1.2 | 2026-10-27 | §2：画面が見えたときにも新しい版を確かめる。待っていた版が次に開いたときに使われることを書いた（WS-0001 の手動テストで、iPhone に「更新」の案内が出なかったため） |
| 1.3 | 2026-10-27 | §2：登録の直後にも新しい版を確かめる（WS-0001 の手動テストの診断で、iPhone のホーム画面のアプリは、登録の時点ではまだ確かめていなかったため） |
| 1.4 | 2026-10-28 | §2 ほか：アプリ名を「銀河戦争ミニ」にする（`name`・`short_name`・`<title>`・`apple-mobile-web-app-title`。仕様書 v1.6） |
| 1.5 | 2026-10-29 | §7：E2E の `iphonese-webkit` を iPhone SE (3rd gen)（375 × 667）にする（仕様書 v1.8） |
