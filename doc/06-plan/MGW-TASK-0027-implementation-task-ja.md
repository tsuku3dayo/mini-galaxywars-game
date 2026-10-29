---
id: MGW-TASK-0027
type: implementation-task
title: core：出撃待ち・種と隕石の初めの並び
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-WS-0010（v1.0）
  - MGW-TD-0002（v1.5）
  - MGW-TC-0010（v1.2）
  - MGW-TC-0016（v1.2）
  - MGW-TC-0018（v1.1）
  - MGW-TC-0030（v1.1）
verified: null
---

# MGW-TASK-0027 core：出撃待ち・種と隕石の初めの並び

* **workstream**：MGW-WS-0010
* **ブランチ**：`feat/TASK-0027-core-standby-seed`
* **依存**：MGW-TASK-0026
* **実施記録**：attested-computation の同じ番号（0027）。作るのはこの TASK の PR

## やること

- types.ts：`standby` を足す（`GameStatus`・`pausedFrom`）
- game.ts：待ちのあとは standby、standby の `launch` で ready（x = 240、発射しない）、永久パターン防止は standby でも進む、`togglePause` に standby（MGW-TD-0002 §6）
- random.ts：`createRandom`（mulberry32）・`meteorStartPositions`。`newGame(highScore, seed)` で隕石の初めの並びを決める（MGW-TD-0002 §5・§10）
- app：`newGame` に種を渡す（いまは仮に固定の種でよい。種の決め方・`?debug=1&seed`・`data-seed` は MGW-TASK-0028）。standby のときも `launch` を渡す（`takeStepInput`）
- 流れが変わる単体テスト・E2E（待ちのあと Ready に戻る前提のもの）を直す

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0010-07 | MGW-US-0010 | 隕石の初めの並びはゲームごとに変わる（種から決める）。となりどうしは、1 周の道のりの 1/10 以上離れている | 自動（単体） |
| MGW-TC-0016-02 | MGW-US-0016 | ミスすると残機が 1 減り、2 秒後に出撃待ちになる | 自動（単体） |
| MGW-TC-0016-04 | MGW-US-0016 | 最上部を抜けたとき、または UFO を倒したとき（8 機目を除く）は、1 秒後に出撃待ちになる。残機は減らない | 自動（単体） |
| MGW-TC-0016-07 | MGW-US-0016 | 出撃待ちの間は発射台は出ず、UFO は光線を撃たない。UFO・隕石は動き続け、永久パターン防止のタイマーも進む | 自動（単体） |
| MGW-TC-0016-09 | MGW-US-0016 | 出撃待ちで `launch` が来ると、発射台が x = 240 に出て Ready に戻る。このタップでは発射しない | 自動（単体） |
| MGW-TC-0018-03 | MGW-US-0018 | 再開すると、発射前に止めたときは Ready、上昇中に止めたときは Playing、出撃待ちで止めたときは出撃待ちに戻る | 自動（単体） |
| MGW-TC-0030-01 | MGW-US-0030 | 同じ種と同じ入力の列を 2 回流すと、状態とスコアが毎回まったく同じになる | 自動（単体） |
| MGW-TC-0030-03 | MGW-US-0030 | 画面の更新が 60 Hz でも 120 Hz でも、同じ種と同じ入力の列なら同じ結果になる | 自動（単体） |
| MGW-TC-0030-04 | MGW-US-0030 | ゲームのルール（src/core）が DOM・時刻・`Math.random` を使っていない | 自動（単体：Lint の決まり） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0027、draft）に自動テストの結果を書き、同じ PR に入れた。
