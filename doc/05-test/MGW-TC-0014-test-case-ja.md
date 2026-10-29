---
id: MGW-TC-0014
type: test-case
title: タイトル画面から始める
status: stable
version: 1.3
updated: 2026-10-29
sources:
  - MGW-US-0014（v1.3）
  - MGW-TST-0001（v1.6）
  - MGW-TD-0004（v1.6）
verified: null
---

# MGW-TC-0014 タイトル画面から始める

* **user-story**：MGW-US-0014
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0014-01 | 1 | 起動すると `#/title` のタイトル画面に、アプリ名「銀河戦争ミニ」と「START」が出る | 自動（E2E） | `e2e/title.spec.ts` |
| MGW-TC-0014-02 | 2 | 「START」（または `Space`）で `#/play` に移り、発射前（Ready）から始まる | 自動（E2E） | `e2e/title.spec.ts` |
| MGW-TC-0014-03 | 3 | `#/title`・`#/play`・`#/ranking`・`#/credits` のハッシュで画面が切り替わる | 自動（E2E） | `e2e/title.spec.ts` |
| MGW-TC-0014-04 | 4 | タイトル画面に、START・RANKING・SETTINGS・CREDITS・効果音のボタンが同じ大きさで並び、操作の案内の下に小さめのランキング消去が出る。iPhone 11 では枠に収まり、収まらない小さい画面（iPhone SE）では枠の中でスクロールして全部に届く | 自動（E2E） | `e2e/title.spec.ts` |
| MGW-TC-0014-05 | 5 | タイトル画面に、UFO の絵と部位からの線で得点（側面・上部 50、下部中央 100、下部突起 150）を示す点数の説明と、「4 機目の突起は 600」が出る | 自動（単体） | `tests/unit/score-guide.test.ts` |
| MGW-TC-0014-06 | 5 | 同上 | 自動（E2E） | `e2e/title.spec.ts` |
| MGW-TC-0014-07 | 5 | 同上 | 手動（iPhone・PC） | タイトル画面の点数の説明が、元のゲームの説明（UFO から線を引いて 50・100・150）と同じように読め、どこに当てると何点かが分かる。「4 機目の突起は 600」も読める |
