---
id: MGW-WS-0003
type: workstream
title: 流れと HUD
status: stable
version: 1.3
updated: 2026-10-29
sources:
  - MGW-EP-0003（v1.3）
  - MGW-TST-0001（v1.3）
verified: null
---

# MGW-WS-0003 流れと HUD

* **epic**：MGW-EP-0003
* **実施の順**：3 / 10（前：MGW-WS-0002、次：MGW-WS-0004）

## ねらい

残機・ミス・クリア・ゲームオーバー・増機・永久パターン防止・タイトル・HUD・一時停止を作り、1 回のゲームが最後まで流れるようにする。

## user-story

MGW-US-0014、MGW-US-0015、MGW-US-0016、MGW-US-0017、MGW-US-0018、MGW-US-0019、MGW-US-0020

## TASK（この順に行う）

| 順 | TASK | 内容 | 依存 |
| :--- | :--- | :--- | :--- |
| 1 | MGW-TASK-0009 | 残機・待ち・クリア・ゲームオーバー・増機・永久パターン防止（core） | MGW-TASK-0007 |
| 2 | MGW-TASK-0010 | タイトル画面とルーティング | MGW-TASK-0008 |
| 3 | MGW-TASK-0011 | HUD と終わりの表示 | MGW-TASK-0009、MGW-TASK-0010 |
| 4 | MGW-TASK-0012 | 一時停止 | MGW-TASK-0011 |

## WS の終わりの手動テスト

公開 URL で、次の手動の確認 ID を確かめる（手順は各 test-case と MGW-TST-0001 §6）：MGW-TC-0015-03
