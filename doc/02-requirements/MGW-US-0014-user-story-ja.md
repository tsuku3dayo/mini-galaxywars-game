---
id: MGW-US-0014
type: user-story
title: タイトル画面から始める
status: stable
version: 1.3
updated: 2026-10-29
sources:
  - MGW-EP-0003（v1.3）
  - doc/specification.md (v1.9) §7、§18
  - MGW-ADR-0007（v1.2）
verified:
  by: tsuku3dayo
  at: 2026-10-29T15:03:15+09:00
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
| 4 | タイトル画面に、START・RANKING・SETTINGS・CREDITS・効果音のボタンが同じ大きさで並び、操作の案内の下に小さめのランキング消去が出る。iPhone 11 では枠に収まり、収まらない小さい画面（iPhone SE）では枠の中でスクロールして全部に届く | E2E |
| 5 | タイトル画面に、UFO の絵と部位からの線で得点（側面・上部 50、下部中央 100、下部突起 150）を示す点数の説明と、「4 機目の突起は 600」が出る | E2E・手動（iPhone・PC） |
