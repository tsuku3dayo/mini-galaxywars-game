---
id: MGW-AC-0027
type: attested-computation
title: 出撃待ちと、種から決める隕石の初めの並びの確認
status: draft
version: 1.0
updated: 2026-10-29
sources:
  - MGW-TASK-0027（v1.0）
  - MGW-TC-0010（v1.2）
  - MGW-TC-0016（v1.2）
  - MGW-TC-0018（v1.1）
  - MGW-TC-0030（v1.1）
verified: null
---

# MGW-AC-0027 出撃待ちと、種から決める隕石の初めの並びの確認

* **TASK**：MGW-TASK-0027（ブランチ `feat/TASK-0027-core-standby-seed`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0010-07 | 隕石の初めの並びはゲームごとに変わる（種から決める）。となりどうしは、1 周の道のりの 1/10 以上離れている | OK | `✓ tests/unit/meteor.test.ts > 隕石 > MGW-TC-0010-07 …`。同じ種なら同じ並び、種 0〜99 の並びはすべて違う。2,000 個の種で、5 個とも道のり（0〜5,016）の上にあり、となりどうし（最後と最初を含む）の間は 501.6 以上。乱数は 0 以上 1 未満 |
| MGW-TC-0016-02 | ミスすると残機が 1 減り、2 秒後に出撃待ちになる | OK | `✓ tests/unit/lives.test.ts > 残機と待ち > MGW-TC-0016-02 …`。239 ステップではまだ待ち、240 ステップで standby。タップしなければ 600 ステップたっても standby のまま |
| MGW-TC-0016-04 | 最上部を抜けたとき、または UFO を倒したとき（8 機目を除く）は、1 秒後に出撃待ちになる。残機は減らない | OK | 同じく MGW-TC-0016-04。どちらも 120 ステップで standby、残機 3 のまま |
| MGW-TC-0016-07 | 出撃待ちの間は発射台は出ず、UFO は光線を撃たない。UFO・隕石は動き続け、永久パターン防止のタイマーも進む | OK | 同じく MGW-TC-0016-07。300 ステップの間に光線は出ず、UFO・隕石は動き、`idleSteps` は 300 進む。150 秒に着くと gameOver。光線・隕石が発射台の場所にあってもミスにならない |
| MGW-TC-0016-09 | 出撃待ちで `launch` が来ると、発射台が x = 240 に出て Ready に戻る。このタップでは発射しない | OK | 同じく MGW-TC-0016-09。左右・指の x・噴射だけでは standby のまま。`launch` で ready（発射台 x 240、ミサイル (240, 596)、発射していない）、次の `launch` で playing |
| MGW-TC-0018-03 | 再開すると、発射前に止めたときは Ready、上昇中に止めたときは Playing、出撃待ちで止めたときは出撃待ちに戻る | OK | `✓ tests/unit/pause.test.ts > 一時停止 > MGW-TC-0018-03 …`。standby → paused（`pausedFrom: 'standby'`）→ standby。止めている間の `launch` では出撃しない |
| MGW-TC-0030-01 | 同じ種と同じ入力の列を 2 回流すと、状態とスコアが毎回まったく同じになる | OK | `✓ tests/unit/determinism.test.ts > 決定性 > MGW-TC-0030-01 …`（種 20261029、3,600 ステップ） |
| MGW-TC-0030-03 | 画面の更新が 60 Hz でも 120 Hz でも、同じ種と同じ入力の列なら同じ結果になる | OK | 同じく MGW-TC-0030-03 |
| MGW-TC-0030-04 | ゲームのルール（src/core）が DOM・時刻・`Math.random` を使っていない | OK | `✓ tests/unit/layer-rules.test.ts > 層の決まり > MGW-TC-0030-04 …`。`random.ts` と同じ式（`Math.imul` とシフト）は core でエラーにならない |

単体テストの合計：`Tests 86 passed (86)`。E2E の合計：`118 passed`、`17 skipped`。`npm run verify` も通った。

そのほか：

- 前からの単体テストの `newGame(0)` は、種を渡す `newGame(0, 1)` に直した。待ちのあとに Ready に戻る前提のテスト（MGW-TC-0007-05・MGW-TC-0013-04）は、standby になることを確かめる形に直した。
- `layer-rules.test.ts` は、ESLint の読み込みに時間がかかり、全部のテストと並べて動かしたときに既定の 5 秒を超えて 1 回落ちたので、待つ時間を 60 秒にした。
- app：タップ・クリック・`Space` は、standby のときも `launch` として渡す（出撃）。タブが隠れたときの一時停止に standby を足した。

画面：この TASK では描き方を変えていない。出撃待ちの間は、今までの待ちと同じく発射台とミサイルを描かない。「タップで出撃」の案内は MGW-TASK-0028。

## 2. 手動の確認

この TASK に手動の確認 ID はない。

## 3. 設計と違う作りにしたこと

なし。MGW-TD-0002 v1.5 のとおり。

- 種の決め方（`crypto.getRandomValues`）・`?debug=1&seed`・`data-seed` は MGW-TASK-0028 で入れるので、それまでは app から決まった種（0）を渡す。隕石の並びは毎回同じだが、v1.6 までの等しい間の並びとは変わる。

## 4. 確認できなかったこと

- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
