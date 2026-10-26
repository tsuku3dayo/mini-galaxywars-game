---
id: MGW-WS-0006
type: workstream
title: ランキング
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-EP-0006（v1.0）
  - MGW-TST-0001（v1.0）
verified: null
---

# MGW-WS-0006 ランキング

* **epic**：MGW-EP-0006
* **実施の順**：6 / 7（前：MGW-WS-0005、次：MGW-WS-0007）

## ねらい

ランキングの保存・名前の入力・ランキング画面・JSON の書き出しと読み込みを作る。

## user-story

MGW-US-0025、MGW-US-0026、MGW-US-0027

## TASK（この順に行う）

| 順 | TASK | 内容 | 依存 |
| :--- | :--- | :--- | :--- |
| 1 | MGW-TASK-0017 | ランキングの保存（ranking-store） | MGW-TASK-0001 |
| 2 | MGW-TASK-0018 | 名前の入力とランキング画面 | MGW-TASK-0011、MGW-TASK-0017 |
| 3 | MGW-TASK-0019 | ランキングの書き出し・読み込み | MGW-TASK-0018 |

## WS の終わりの手動テスト

手動の確認 ID はない。公開 URL で、この WS で作ったものが動くことだけを見る。
