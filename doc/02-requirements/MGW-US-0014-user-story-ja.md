---
id: MGW-US-0014
type: user-story
title: タイトル画面から始める
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-EP-0003（v1.0）
  - doc/specification.md (v1.4) §7、§18
  - MGW-ADR-0007（v1.1）
verified:
  by: tsuku3dayo
  at: 2026-10-26T16:22:35+09:00
---

# MGW-US-0014 タイトル画面から始める

* **epic**：MGW-EP-0003
* **優先順位**：3-1
* **種類**：機能

## ストーリー

* **だれが**：プレイヤー
* **したいこと**：タイトル画面から START でゲームを始める
* **なぜ**：始め方が迷わず分かるようにするため

## 受け入れ条件

| No | 条件 | 確かめ方 |
| :--- | :--- | :--- |
| 1 | 起動すると `#/title` のタイトル画面に、アプリ名「ギャラクシーウォーズミニ」と「START」が出る | E2E |
| 2 | 「START」（または `Space`）で `#/play` に移り、発射前（Ready）から始まる | E2E |
| 3 | `#/title`・`#/play`・`#/ranking` のハッシュで画面が切り替わる | E2E |
