---
id: MGW-WS-0002
type: workstream
title: ゲームの核
status: stable
version: 1.5
updated: 2026-10-29
sources:
  - MGW-EP-0002（v1.0）
  - MGW-TST-0001（v1.5）
verified: null
---

# MGW-WS-0002 ゲームの核

* **epic**：MGW-EP-0002
* **実施の順**：2 / 12（前：MGW-WS-0001、次：MGW-WS-0003）

## ねらい

core（定数・状態・動き・当たり判定・得点）と描画・PC の操作を作り、PC で 1 面を遊べるようにする。

## user-story

MGW-US-0005、MGW-US-0006、MGW-US-0007、MGW-US-0008、MGW-US-0009、MGW-US-0010、MGW-US-0011、MGW-US-0012、MGW-US-0013、MGW-US-0030

## TASK（この順に行う）

| 順 | TASK | 内容 | 依存 |
| :--- | :--- | :--- | :--- |
| 1 | MGW-TASK-0005 | core の土台（定数・状態・ステップ・決定性） | MGW-TASK-0001 |
| 2 | MGW-TASK-0006 | 発射台・ミサイル・UFO・隕石・光線の動き | MGW-TASK-0005 |
| 3 | MGW-TASK-0007 | 当たり判定・光線弾き・得点 | MGW-TASK-0006 |
| 4 | MGW-TASK-0008 | 描画と PC でのプレイ画面 | MGW-TASK-0004、MGW-TASK-0007 |

## WS の終わりの手動テスト

公開 URL で、次の手動の確認 ID を確かめる（手順は各 test-case と MGW-TST-0001 §6）：MGW-TC-0007-04、MGW-TC-0009-05、MGW-TC-0030-05
