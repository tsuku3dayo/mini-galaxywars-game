---
id: MGW-AC-0012
type: attested-computation
title: 一時停止の確認
status: stable
version: 1.0
updated: 2026-10-27
sources:
  - MGW-TASK-0012（v1.0）
  - MGW-TC-0018（v1.1）
verified:
  by: tsuku3dayo
  at: 2026-10-27T16:35:41+09:00
---

# MGW-AC-0012 一時停止の確認

* **TASK**：MGW-TASK-0012（ブランチ `feat/TASK-0012-pause`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1（Chromium・WebKit）

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0018-01 | `P`・`Esc`・「Pause」ボタンで一時停止し、もう一度押すと再開する | OK（3 つの project。`P`・`Esc` は pc-chromium） | `✓` › e2e\pause.spec.ts › MGW-TC-0018-01。Pause → Pause、Pause → RESUME、`P`・`Esc` で止まり・戻る。止まっている間は `PAUSE` と「RESUME」が出て（`data-overlay=pause`）、ステップが進まない。Pause はタイトルでは出ない |
| MGW-TC-0018-02 | タブが隠れたり、アプリが裏に回ったりすると、一時停止になる | OK（3 つの project） | 同じく MGW-TC-0018-02。`visibilitychange`（hidden）で止まる。また見えても勝手には再開せず、RESUME で戻る |
| MGW-TC-0018-03 | 再開すると、発射前に止めたときは Ready、上昇中に止めたときは Playing に戻る | OK | `✓ tests/unit/pause.test.ts > 一時停止 > MGW-TC-0018-03 …`。待ちの間に止めたときは待ちに戻る。終わったあとは止めない |
| MGW-TC-0018-04 | 一時停止の間は、ゲームの時間（永久パターン防止のタイマーを含む）が進まない | OK | 同じく MGW-TC-0018-04。600 ステップ分の入力を与えても状態は変わらず、再開すると続きから進む |

単体テストの合計：`Tests 58 passed (58)`。E2E の合計：`58 passed`、`8 skipped`。`pause.spec.ts`・`gameplay.spec.ts` を `--repeat-each=3` で動かして `45 passed`。`npm run verify` も通った。

画面：E2E（iPhone 11・iPhone SE の幅と PC）で、Pause・PAUSE・RESUME が押せて見えることを確かめた。

## 2. 手動の確認

この TASK の確認 ID には手動のものはない。§4 のついでに、WS-0003 の終わり（2026-10-27、オーナー、iPhone 11）に次を確かめた。

- ホーム画面の本物の「GWミニ」で遊び始め、閉じずにホーム画面に戻ってから開き直すと、`PAUSE` と「RESUME」が出ていた（OK）。

## 3. 設計と違う作りにしたこと

- 上のバーをゲーム画面と同じ幅にし、Pause をゲーム画面の右端にそろえた（PC の広い窓でも、ゲーム画面から離れないように）。
- 一時停止・再開のときに、押していたキー・指を忘れる（再開したとたんに噴射し続けないように）。
- Pause・RESUME は押したらすぐフォーカスを外す（そのあとの `Space` で、もう一度押されないように）。
- クリア・ゲームオーバーのあとは Pause を出さない（止めるものがないため）。
- 一時停止の表示と同じ場所にある E2E（MGW-TC-0017-02 と READY）が、PC が重いときに時間の前提で落ちたので、時間に頼らない形に直した（READY は `stepCount` を 0 に戻してから見る。TITLE が出ないことはクリアの直後に見る）。

## 4. 確認できなかったこと

- iPhone のホーム画面のアプリを本当に裏に回したときは、E2E では確かめていない（`visibilitychange` の知らせを送って確かめた）。§2 のとおり、手動で確かめた。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
