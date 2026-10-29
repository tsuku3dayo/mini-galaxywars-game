---
id: MGW-AC-0031
type: attested-computation
title: 効果音のオン・オフの確認
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-TASK-0031（v1.0）
  - MGW-TC-0014（v1.4）
  - MGW-TC-0023（v1.3）
  - MGW-TC-0034（v1.0）
verified:
  by: tsuku3dayo
  at: 2026-10-29T14:47:07+09:00
---

# MGW-AC-0031 効果音のオン・オフの確認

* **TASK**：MGW-TASK-0031（ブランチ `feat/TASK-0031-sound-toggle`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

E2E は 3 つの project（`pc-chromium`・`iphone11-webkit`・`iphonese-webkit`）で通った。

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-04 | タイトル画面に、START・RANKING・SETTINGS のほか、CREDITS・ランキング消去・効果音のボタンが出て、iPhone SE の高さでもゲーム画面の枠に収まる | OK | `✓` › e2e\title.spec.ts › MGW-TC-0014-04（3 つの project）。6 つのボタンがゲーム画面の枠の中にあり、高さ 44 以上で、重ならない。HIGH・アプリ名・操作の案内も枠に収まる |
| MGW-TC-0023-10 | 上の音は、効果音がオンのときだけ鳴る | OK | `✓ tests/unit/synthesizer.test.ts > 音の合成 > MGW-TC-0023-10 …`。オンなら 4 種ともノードを作り、オフならどれも作らない。オンに戻すとまた鳴る |
| MGW-TC-0034-01 | タイトル画面とプレイ画面に、効果音のボタンがある。プレイ画面では、操作空間の下の右 | OK | `✓` › e2e\sound-toggle.spec.ts › MGW-TC-0034-01。「効果音：オン」とスピーカーの印。プレイ画面ではゲーム画面（iPhone は操作空間）より下で、右の端がゲーム画面の右の端にそろい、左の一時停止と同じ段 |
| MGW-TC-0034-02 | 押すたびにオンとオフが入れ替わり、2 つのボタンの表示がそろう | OK | `✓` › e2e\sound-toggle.spec.ts › MGW-TC-0034-02。タイトルでオフにするとプレイ画面もオフ、プレイ画面でオンにするとタイトルもオン（`aria-pressed`・`data-sound` も同じ） |
| MGW-TC-0034-03 | オフのときは、どの効果音も鳴らない。噴射音が鳴っているときに押すと、すぐ止まる | OK | `✓ tests/unit/synthesizer.test.ts > 音の合成 > MGW-TC-0034-03 …`。オフにした時刻に噴射音を止める（0.08 秒かけない）。オフの間の jetOn・miss は鳴らさない。オンに戻しても噴射音は鳴らし直さず、次の jetOn から鳴る。オフの間も unlock は効き、オンに戻すとすぐ鳴る |
| MGW-TC-0034-05 | 設定は端末に保存され、開き直しても同じ。初めはオン。前からの設定はオンとして読み、表示方式は変わらない | OK | `✓ tests/unit/settings-store.test.ts > 設定の保存 > MGW-TC-0034-05 …`。`{ app, version, displayMode, sound }` で保存し、どちらか一方を変えても、もう一方は消えない。`sound` がない・真偽値でないときはオン |
| MGW-TC-0034-06 | 同上 | OK | `✓` › e2e\sound-toggle.spec.ts › MGW-TC-0034-06。オフにして読み込み直してもオフ。前の形の設定（`displayMode: 'pixel'` だけ）は、オン・ピクセルパーフェクトで読む |
| MGW-TC-0034-07 | プレイ中に押しても、ゲームは止まらず、発射・移動にもならない | OK | `✓` › e2e\sound-toggle.spec.ts › MGW-TC-0034-07。発射前に押しても ready のまま、発射台は動かず、ステップは進む。上昇中に押しても playing のまま上昇を続ける |

単体テストの合計：`Tests 96 passed (96)`。E2E の合計：`175 passed`、`20 skipped`。`npm run verify` も通った。

そのほか：

- 設定の保存（`settings-store.ts`）は、`loadDisplayMode`・`saveDisplayMode` を `load()`・`save(patch)` にした（MGW-TD-0006 §2）。表示方式の E2E（MGW-TC-0029-03）の保存の形に `sound: true` を足した。
- タイトル画面は、ボタンが 6 つになって iPhone SE（320 × 568）の枠から 8 px はみ出したので、背の低い画面（高さ 620 px 以下）では、間を詰め、飾りの UFO とアプリ名を少し小さくした（ボタンは 44 px のまま）。
- スピーカーの印（オン・オフ）は `src/app/icons.ts` に足した。

画面：iPhone 11・iPhone SE・PC（1280 × 800）で、タイトル画面（CREDITS・ランキング消去の下に「🔊 効果音：オン」）と、プレイ画面のボタンの段（左に「‖ 一時停止」、右に「🔊 効果音：オン」）のスクリーンショットを見た。

## 2. 手動の確認（WS-0010 の終わり、2026-10-29、オーナー、iPhone 11・PC）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0034-04 | オフのときは、どの効果音も鳴らない。噴射音が鳴っているときに押すと、すぐ止まる | OK（iPhone・PC） |
| MGW-TC-0034-08 | オフで始めてから iPhone でオンに戻すと、すぐ鳴る | OK（iPhone のホーム画面の本物のアプリ） |

## 3. 設計と違う作りにしたこと

なし。MGW-TD-0004 v1.2・MGW-TD-0005 v1.2・MGW-TD-0006 v1.1・MGW-GUI-0002 v1.2・MGW-GUI-0003 v1.2 のとおり。

## 4. 確認できなかったこと

- 音が鳴ること・止まることそのものは自動では確かめられない（E2E の WebKit には AudioContext がなく、Chromium は鳴らない）。WS の終わりに PC と iPhone で聞いてもらい、OK だった（§2）。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
