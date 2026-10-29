---
id: MGW-TC-0030
type: test-case
title: 同じ入力から同じ展開になる（決定性）
status: stable
version: 1.1
updated: 2026-10-29
sources:
  - MGW-US-0030（v1.1）
  - MGW-TST-0001（v1.3）
  - MGW-TD-0001（v1.1）
  - MGW-TD-0002（v1.5）
verified: null
---

# MGW-TC-0030 同じ入力から同じ展開になる（決定性）

* **user-story**：MGW-US-0030
* **種類**：非機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0030-01 | 1 | 同じ種と同じ入力の列を 2 回流すと、状態とスコアが毎回まったく同じになる | 自動（単体） | `tests/unit/determinism.test.ts` |
| MGW-TC-0030-02 | 2 | 物理は 1/120 秒の固定ステップで進み、1 回の描画で進めるのは最大 12 ステップ | 自動（単体） | `tests/unit/determinism.test.ts` |
| MGW-TC-0030-03 | 3 | 画面の更新が 60 Hz でも 120 Hz でも、同じ種と同じ入力の列なら同じ結果になる | 自動（単体） | `tests/unit/determinism.test.ts` |
| MGW-TC-0030-04 | 4 | ゲームのルール（src/core）が DOM・時刻・`Math.random` を使っていない（乱数は、app が渡す種から決まった式で作る） | 自動（単体：Lint の決まり） | `tests/unit/layer-rules.test.ts` |
| MGW-TC-0030-05 | 5 | iPhone の実機で、ゲームの時間と実際の時間がずれない（デバッグ表示で、1 秒あたり 120 ステップ進むことを見る） | 手動（iPhone） | ?debug=1 で 1 分遊び、デバッグ表示のステップ数が 1 秒あたり 120（±1）のまま |
