---
id: MGW-AC-0003
type: attested-computation
title: PWA（マニフェスト・オフライン・「更新」ボタン）の確認
status: draft
version: 1.0
updated: 2026-10-26
sources:
  - MGW-TASK-0003（v1.0）
  - MGW-TC-0002（v1.0）
  - MGW-TC-0003（v1.0）
verified: null
---

# MGW-AC-0003 PWA（マニフェスト・オフライン・「更新」ボタン）の確認

* **TASK**：MGW-TASK-0003（ブランチ `feat/TASK-0003-pwa`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Playwright 1.64.1（Chromium・WebKit）

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0002-01 | 一度開いたあと、ネットワークを切っても起動して遊べる | OK（pc-chromium） | `npm run test:e2e`：`✓ [pc-chromium] › e2e\offline.spec.ts › オフライン › MGW-TC-0002-01 …`。WebKit の 2 つの project は設計どおり飛ばした（MGW-TST-0001 §1.1、Playwright の WebKit は Service Worker の扱いが限られる） |
| MGW-TC-0002-03 | 公開するファイルに外部の URL がない | OK | `npm run check:dist`：`check:dist — エラー 0 件`。Workbox のエラーの説明文の URL（`https://bit.ly/wb-precache`、通信しない）だけを許す |
| MGW-TC-0002-04 | マニフェストの name と Service Worker の範囲 | OK | `npm run check:dist`：name「ギャラクシーウォーズミニ」・short_name「GWミニ」・scope と start_url が `/mini-galaxywars-game/`、`sw.js` が dist の直下にあり、キャッシュの名前に `mini-galaxywars` を含む |
| MGW-TC-0003-01 | 新しい版が届くと、タイトル画面とランキング画面に「更新」ボタンが出る | OK（3 つの project） | `✓ [pc-chromium]`・`✓ [iphone11-webkit]`・`✓ [iphonese-webkit]` › e2e\pwa-update.spec.ts › MGW-TC-0003-01。画面が見えたとき（`visibilitychange`）に新しい版を確かめることも、`✓ [pc-chromium]` › MGW-TC-0003-01 アプリが前に戻ってきたとき… で確かめた（fix/TASK-0003-update-check-on-resume。直す前の作りでは落ちることも確かめた） |
| MGW-TC-0003-02 | 「更新」を押すと、新しい版に切り替わって再読み込みされる | OK（3 つの project） | 同じく MGW-TC-0003-02。E2E では `__mgw.simulateUpdate()` を使い、押したときに `data-update=applied` になることを確かめた（本当の切り替えは §2 の手動で見る） |
| MGW-TC-0003-03 | プレイ中（#/play）は「更新」を出さず、版も切り替わらない | OK（3 つの project） | 同じく MGW-TC-0003-03 |

E2E の合計：`10 passed`、`2 skipped`（14.1 秒）。`npm run verify` も通った。

## 2. 手動の確認（WS-0001 の終わりに書く）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0002-02 | iPhone で機内モードにして、ホーム画面のアプリから起動して遊べる | 未実施（WS-0001 の終わりに確かめる） |
| MGW-TC-0002-05 | iPhone のホーム画面に追加でき、アプリの名前が切れない | 未実施（WS-0001 の終わりに確かめる） |

## 3. 設計と違う作りにしたこと

- `src/app/router.ts` に、ハッシュから画面を決める最小の部分を先に作った（「プレイ中は出さない」を確かめるため）。画面の中身は MGW-TASK-0008・0010 で足す。
- `#stage` に仮の大きさ（幅 480 まで、3:4）を付けた。倍率の計算は MGW-TASK-0008 で作る。
- 03 の試作（`prototype/`）は公開し続けるが、アプリの Service Worker のキャッシュには入れない（`globIgnores`）。
- 画面が見えたときにも新しい版を確かめるようにした（MGW-TD-0007 v1.2 §2）。WS-0001 の手動テストで、iPhone のホーム画面のアプリに「更新」の案内が出なかったため。
- `test:e2e` の `--pass-with-no-tests` を外し、MGW-TS-0001 §3 のとおり `playwright test` に戻した（MGW-AC-0001 §3 で予告したもの）。

## 4. 確認できなかったこと

- 本当に新しい版を公開したときの切り替えは、E2E では確かめていない（MGW-TST-0001 §6.1）。WS-0001 の終わりに、公開 URL で手動で確かめる。
