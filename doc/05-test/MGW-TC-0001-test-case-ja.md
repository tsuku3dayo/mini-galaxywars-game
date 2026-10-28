---
id: MGW-TC-0001
type: test-case
title: 公開 URL で開ける
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0001（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0007（v1.3）
verified: null
---

# MGW-TC-0001 公開 URL で開ける

* **user-story**：MGW-US-0001
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0001-01 | 1 | main へのマージで、`https://tsuku3dayo.github.io/mini-galaxywars-game/` に公開される | 手動（CI） | main へのマージのあと、Actions の Pages の実行が成功し、公開 URL を開くと新しい版になっている |
| MGW-TC-0001-02 | 2 | PR では verify と E2E が CI で動き、失敗するとマージの前に分かる | 手動（CI） | PR の画面に verify と e2e の結果が出る。失敗したものはマージの前に赤で分かる |
| MGW-TC-0001-03 | 3 | 公開 URL を PC のブラウザと iPhone の Safari で開ける | 手動（iPhone・PC） | PC のブラウザと iPhone の Safari で公開 URL を開き、タイトル画面が出る |
