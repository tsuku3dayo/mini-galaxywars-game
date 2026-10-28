---
id: MGW-WS-0008
type: workstream
title: 増機の点数（修正用）
status: stable
version: 1.0
updated: 2026-10-28
sources:
  - MGW-EP-0003（v1.2）
  - MGW-TST-0001（v1.1）
  - doc/requests/2026-10-27-spec-1.5-extend-score.md
verified: null
---

# MGW-WS-0008 増機の点数（修正用）

* **epic**：MGW-EP-0003
* **実施の順**：6 / 8（前：MGW-WS-0005、次：MGW-WS-0006）

## ねらい

仕様書 v1.5 に合わせて、増機の点数を 3,000 点から 1,000 点にする。1 面で取れる点数（多くても 1,650 点）で増機に届くようにする（doc/requests/2026-10-27-spec-1.5-extend-score.md）。

## 実施の順

仕様の変更で足した WS なので、WS-0005 のすぐあと、WS-0006 の前に行う。

| 順 | WS | 内容 |
| :--- | :--- | :--- |
| 1〜5 | MGW-WS-0001〜MGW-WS-0005 | （完了） |
| 6 | **MGW-WS-0008** | 増機の点数（修正用） |
| 7 | MGW-WS-0006 | ランキング |
| 8 | MGW-WS-0007 | 表示方式 |

## user-story

MGW-US-0019、MGW-US-0023

## TASK（この順に行う）

| 順 | TASK | 内容 | 依存 |
| :--- | :--- | :--- | :--- |
| 1 | MGW-TASK-0022 | 増機の点数を 1,000 点にする | MGW-TASK-0011、MGW-TASK-0015 |

## WS の終わりの手動テスト

公開 URL で、次の手動の確認 ID を確かめる（手順は各 test-case と MGW-TST-0001 §6）：MGW-TC-0023-06（増機音。PC と iPhone で、ふつうに遊んで 1,000 点に届かせる）
