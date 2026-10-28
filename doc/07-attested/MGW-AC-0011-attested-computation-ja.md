---
id: MGW-AC-0011
type: attested-computation
title: HUD と終わりの表示の確認
status: stable
version: 1.0
updated: 2026-10-27
sources:
  - MGW-TASK-0011（v1.1）
  - MGW-TC-0015（v1.0）
  - MGW-TC-0017（v1.0）
  - MGW-TC-0019（v1.1）
verified:
  by: tsuku3dayo
  at: 2026-10-27T16:35:41+09:00
---

# MGW-AC-0011 HUD と終わりの表示の確認

* **TASK**：MGW-TASK-0011（ブランチ `feat/TASK-0011-hud-messages`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1（Chromium・WebKit）

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0015-01 | HUD 帯（y 0–48）に「SCORE」「HIGH」と残機が出る | OK（3 つの project） | `✓` › e2e\hud.spec.ts › MGW-TC-0015-01。Canvas の画素を読み、SCORE（左上）・HIGH（右上）・残機（右の 2 行目）の場所に描かれていること、HUD 帯の真ん中の上には何もないこと、残機のアイコンが 3 つの塊であることを確かめた。`data-score`・`data-high`・`data-lives` も出る |
| MGW-TC-0015-02 | スコアは 5 桁のゼロ詰め（例：`00150`）で出る | OK | `✓ tests/unit/hud.test.ts > HUD > MGW-TC-0015-02 …` |
| MGW-TC-0015-04 | HIGH は、ランキングの 1 位のスコアと、今のスコアの大きい方 | OK | 同じく MGW-TC-0015-04。ゲームを始めたときの 1 位（`highScore`）と今のスコアの大きい方 |
| MGW-TC-0017-02 | UFO を 8 機すべて倒すと、クリアの表示が出てゲームが終わる | OK（3 つの project） | `✓` › e2e\gameplay.spec.ts › MGW-TC-0017-02。`GOOD!!` と `STAGE CLEAR` が出て（`data-overlay=clear`）、ステップは進まない。3 秒後に「TITLE」が出て、押すとタイトルに戻る |
| MGW-TC-0019-02 | スコアが 3,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | OK（3 つの project） | `✓` › e2e\hud.spec.ts › MGW-TC-0019-02。2,950 点から UFO を倒して 3,050 点になると、`data-lives` が 4 になり、Canvas のアイコンの塊が 3 から 4 に増える |

そのほか：GAME OVER の表示と、ゲームの最初の 1 秒だけ READY を出すことも E2E で確かめた（`gameplay.spec.ts`）。

単体テストの合計：`Tests 56 passed (56)`。E2E の合計：`52 passed`、`8 skipped`。`npm run verify` も通った。

画面：iPhone SE の幅（WebKit）と PC で、READY・HUD・クリアの表示（3 秒後の TITLE を含む）を表示して確かめた。

## 2. 手動の確認（WS-0003 の終わり、2026-10-27、オーナー、PC）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0015-03 | 残機は、ミサイルではなく発射台のアイコンの数で出る | OK（PC、公開 URL でタイトルの START から。HIGH の下に発射台の形のアイコンが 3 つ並んだ） |

- 版の切り替え：PR #29 をマージする前に、PC と iPhone（ホーム画面の本物の「GWミニ」）で前の版を開いておいた。公開のあと、どちらも「更新」で切り替わった。

## 3. 設計と違う作りにしたこと

- 残機のアイコンは、画面に出ている 1 基を含む残機の数だけ並べる（始めは 3 つ）。MGW-GUI-0003 §1 の図（▭ ▭ ▭）に合わせた。
- 残機のアイコンの絵（MGW-TASK-0008 で作ったもの）が丸い山の形で発射台に見えなかったので、中央に差し込み口のある台の形に直した（大きさは 16 × 6 のまま）。
- 終わったあと 3 秒で出すのは、いまは「TITLE」だけ。ランキングに入るときの名前の入力への分かれ道は MGW-TASK-0018 で足す。
- 中央の表示（READY・GOOD!!・STAGE CLEAR・GAME OVER）は DOM の端末の等幅フォントで出した（MGW-TD-0003 §4。Canvas に描くのは HUD だけ）。

## 4. 確認できなかったこと

- アイコンの形（発射台に見えるか）は E2E では分からないので、§2 の手動で見た。
