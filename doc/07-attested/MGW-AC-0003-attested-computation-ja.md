---
id: MGW-AC-0003
type: attested-computation
title: PWA（マニフェスト・オフライン・「更新」ボタン）の確認
status: stable
version: 1.0
updated: 2026-10-27
sources:
  - MGW-TASK-0003（v1.0）
  - MGW-TC-0002（v1.0）
  - MGW-TC-0003（v1.0）
verified:
  by: tsuku3dayo
  at: 2026-10-27T13:19:56+09:00
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

## 2. 手動の確認（WS-0001 の終わり、2026-10-27、オーナー、iPhone 11・PC）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0002-02 | iPhone で機内モードにして、ホーム画面のアプリから起動して遊べる | OK（タイトル画面まで）。一度開いて完全に閉じ、機内モードで起動するとタイトル画面が出た。ゲームはまだないので「遊べる」は §4 |
| MGW-TC-0002-05 | iPhone のホーム画面に追加でき、アプリの名前が切れない | OK。アイコンの下の名前は「GWミニ」で切れていない |
| （MGW-TC-0003-02 の本当の切り替え） | 新しい版を公開すると「更新」の案内が出て、押すと切り替わる | OK。PC：PR #14 の公開で案内が出て、「更新」で切り替わった。iPhone（ホーム画面のアプリ）：PR #17 の公開で案内が出て、「更新」で切り替わった（一時的な診断の表示で、版が `6631267` から `880b313` に変わったことを確かめた）。PR #18 の公開でも、診断なしで同じように切り替わった |

- 最初の iPhone の確認は、ホーム画面に入っていた 03 の試作（`/prototype/`）で行っていた。試作と本物の名前・アイコンが同じで見分けられなかったため（PR #17 で試作の名前を「GW試作」にした）。上の 3 つは、本物のアプリ（`/mini-galaxywars-game/`）でやり直した結果。
- iPhone では、ホーム画面に戻している間に iOS がアプリを終了させていて、開き直したときに読み込み直しになった。新しい版は、登録の直後の確認（MGW-TD-0007 v1.3 §2）で見つかった。

## 3. 設計と違う作りにしたこと

- `src/app/router.ts` に、ハッシュから画面を決める最小の部分を先に作った（「プレイ中は出さない」を確かめるため）。画面の中身は MGW-TASK-0008・0010 で足す。
- `#stage` に仮の大きさ（幅 480 まで、3:4）を付けた。倍率の計算は MGW-TASK-0008 で作る。
- 03 の試作（`prototype/`）は公開し続けるが、アプリの Service Worker のキャッシュには入れない（`globIgnores`）。
- 登録の直後と、画面が見えたときにも新しい版を確かめるようにした（MGW-TD-0007 v1.3 §2）。WS-0001 の手動テストで、iPhone のホーム画面のアプリに「更新」の案内が出なかったことから調べた（PR #15・#16・#18。#16 の一時的な診断の表示は #18 で消した）。
- `test:e2e` の `--pass-with-no-tests` を外し、MGW-TS-0001 §3 のとおり `playwright test` に戻した（MGW-AC-0001 §3 で予告したもの）。

## 4. 確認できなかったこと

- 本当に新しい版を公開したときの切り替えは、E2E では確かめていない（MGW-TST-0001 §6.1）。§2 のとおり、公開 URL で手動で確かめた。
- 「アプリが前に戻ってきたとき（読み込み直さずに画面が見えたとき）に新しい版を確かめる」ことは、iPhone の実機では確かめられなかった（iOS がアプリを終了させ、読み込み直しになったため）。E2E（Chromium）でだけ確かめた。
- MGW-TC-0002-02 の「1 回遊べる」は、ゲームを作る WS（MGW-WS-0002 以降）のあとでないと確かめられない。WS-0001 ではタイトル画面が出るところまでを確かめた。リリースの全体の手動テストで、遊べることまで確かめる。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
