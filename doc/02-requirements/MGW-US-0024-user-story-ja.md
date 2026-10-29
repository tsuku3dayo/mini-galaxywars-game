---
id: MGW-US-0024
type: user-story
title: iPhone で音を鳴らせる
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-EP-0005（v1.1）
  - doc/specification.md (v1.8) §22
  - MGW-PB-0001（v1.3） §8
verified:
  by: tsuku3dayo
  at: 2026-10-26T16:22:35+09:00
---

# MGW-US-0024 iPhone で音を鳴らせる

* **epic**：MGW-EP-0005
* **優先順位**：5-2
* **種類**：機能

## ストーリー

* **だれが**：iPhone のプレイヤー
* **したいこと**：iPhone でも効果音を聞く
* **なぜ**：iPhone の Safari は、タッチするまで音を鳴らさないため

## 受け入れ条件

| No | 条件 | 確かめ方 |
| :--- | :--- | :--- |
| 1 | iPhone で、最初のタッチ（「START」など）のあとから音が鳴る | 手動（iPhone） |
| 2 | 音が鳴らせない状態でも、ゲームは止まらずに動く | E2E |

## メモ

- 消音の切り替えを置くかは 03 で決める（仕様書にはない）。
