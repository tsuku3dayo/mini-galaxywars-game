---
id: MGW-TC-0018
type: test-case
title: 一時停止する
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0018（v1.1）
  - MGW-TST-0001（v1.2）
  - MGW-TD-0002（v1.4）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0018 一時停止する

* **user-story**：MGW-US-0018
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0018-01 | 1 | `P`・`Esc`・「Pause」ボタンで一時停止し、もう一度押すと再開する | 自動（E2E） | `e2e/pause.spec.ts` |
| MGW-TC-0018-02 | 2 | タブが隠れたり、アプリが裏に回ったりすると、一時停止になる | 自動（E2E） | `e2e/pause.spec.ts` |
| MGW-TC-0018-03 | 3 | 再開すると、発射前に止めたときは Ready、上昇中に止めたときは Playing に戻る | 自動（単体） | `tests/unit/pause.test.ts` |
| MGW-TC-0018-04 | 4 | 一時停止の間は、ゲームの時間（永久パターン防止のタイマーを含む）が進まない | 自動（単体） | `tests/unit/pause.test.ts` |
