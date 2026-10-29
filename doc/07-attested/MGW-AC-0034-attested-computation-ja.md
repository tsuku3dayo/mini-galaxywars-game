---
id: MGW-AC-0034
type: attested-computation
title: HUD の TIME・クリアの表示の 4 行・ランキングのタイムの確認
status: draft
version: 1.0
updated: 2026-10-29
sources:
  - MGW-TASK-0034（v1.0）
  - MGW-TC-0013（v1.2）
  - MGW-TC-0015（v1.2）
  - MGW-TC-0017（v1.1）
  - MGW-TC-0025（v1.2）
  - MGW-TC-0026（v1.2）
  - MGW-TC-0027（v1.2）
verified: null
---

# MGW-AC-0034 HUD の TIME・クリアの表示の 4 行・ランキングのタイムの確認

* **TASK**：MGW-TASK-0034（ブランチ `feat/TASK-0034-time-bonus-view`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

E2E は 3 つの project（`pc-chromium`・`iphone11-webkit`・`iphonese-webkit`）で通った。

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0015-07 | 左下の残機の行の右に、経過時間が `TIME 095` で出る。SCORE は UFO の得点だけ | OK | `✓ tests/unit/hud.test.ts > HUD > MGW-TC-0015-07 …`。0 ステップ `TIME 000`、95.7 秒 `TIME 095`、180 秒 `TIME 180`、999 で止める。クリアで 425 点を足しても SCORE は `01150`、HIGH は合計の `01575` |
| MGW-TC-0015-08 | 同上 | OK | `✓` › e2e\hud.spec.ts › MGW-TC-0015-08（3 つの project）。残機の行の右（x 340〜468）に文字があり、アイコンとの間には何もない。発射して 240 ステップで `playSteps` 240。クリアすると `data-score` は合計（1,150 ＋ 890） |
| MGW-TC-0017-04 | クリアの表示の下に、UFO の得点・タイム・時間ボーナス・合計が出る。ゲームオーバーでは出ない | OK | `✓` › e2e\gameplay.spec.ts › MGW-TC-0017-04（3 つの project）。95.7 秒・UFO 1,150 点で `UFO   01150`・`TIME  95.7`・`BONUS 00425`・`TOTAL 01575`、`data-score` 1575。ゲームオーバーでは出ない |
| MGW-TC-0025-02 | 記録するのは、スコア（クリアは合計）・プレイヤー名・日時・結果と、クリアのタイム | OK | `✓ tests/unit/ranking-store.test.ts > … > MGW-TC-0025-02 …`。クリアは date・name・result・score・time（95,700）。ゲームオーバーにはタイムを付けない |
| MGW-TC-0026-01 | `#/ranking` に、順位・名前・スコアと、名前の下に結果・タイム・日時が出る | OK | `✓` › e2e\ranking.spec.ts › MGW-TC-0026-01。`CLEAR · 95.7 秒 · 2026/10/26 HH:MM`。タイムのない前からのクリアの記録は `CLEAR · 日時` |
| MGW-TC-0027-07 | タイムが 0〜1,000,000 ミリ秒の整数でない記録や、クリアでない記録にタイムがあるファイルは読み込まない | OK | `✓ tests/unit/ranking-store.test.ts > … > MGW-TC-0027-07 …`。0・95,700・1,000,000 は読める。−100・1,000,100・95.5・文字の `"95700"`・ゲームオーバーや結果なしの記録のタイムは読まない。書き出したタイムはそのまま戻る |

単体テストの合計：`Tests 101 passed (101)`。E2E の合計：`184 passed`、`20 skipped`。`npm run verify` も通った。

そのほか：

- HUD の E2E の残機アイコンを数える範囲を、同じ行に足した TIME の手前（x 330）までにした（TIME の文字まで数えていた）。

画面：iPhone 11・PC（1280 × 800）で、プレイ中の右下の `TIME 005`、クリアの表示（GOOD!!・STAGE CLEAR の下の 4 行。HUD の SCORE は `01150`、HIGH は `01575`）、登録のあとのランキング（`CLEAR · 95.7 秒 · 日時`）のスクリーンショットを見た。iPhone 11 の幅では、名前の下の行が日時の所で 2 行に折り返すが、読める。

## 2. 手動の確認

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0013-08 | 時間ボーナスの大きさが、遊んで納得できる（早く倒すと上乗せになる） | 未実施（WS の終わりに確かめる） |
| MGW-TC-0017-05 | クリアの表示の下に、UFO の得点・タイム・時間ボーナス・合計が出る。ゲームオーバーでは出ない | 未実施（WS の終わりに確かめる） |

## 3. 設計と違う作りにしたこと

なし。MGW-TD-0003 v1.5・MGW-TD-0004 v1.4・MGW-TD-0006 v1.2 のとおり。

- クリアの表示の 4 行は、等幅の文字でラベルの後ろに空白を入れ、値の始まりをそろえた（`UFO   01150`・`TIME  95.7`・`BONUS 00425`・`TOTAL 01575`）。

## 4. 確認できなかったこと

- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
