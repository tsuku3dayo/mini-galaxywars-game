---
id: MGW-US-0014
type: user-story
title: タイトル画面から始める
status: stable
version: 1.2
updated: 2026-10-29
sources:
  - MGW-EP-0003（v1.3）
  - doc/specification.md (v1.7) §7、§18
  - MGW-ADR-0007（v1.2）
verified:
  by: tsuku3dayo
  at: 2026-10-29T10:42:24+09:00
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
| 1 | 起動すると `#/title` のタイトル画面に、アプリ名「銀河戦争ミニ」と「START」が出る | E2E |
| 2 | 「START」（または `Space`）で `#/play` に移り、発射前（Ready）から始まる | E2E |
| 3 | `#/title`・`#/play`・`#/ranking`・`#/credits` のハッシュで画面が切り替わる | E2E |
| 4 | タイトル画面に、START・RANKING・SETTINGS のほか、CREDITS・ランキング消去・効果音のボタンが出て、iPhone SE の高さでもゲーム画面の枠に収まる | E2E |
