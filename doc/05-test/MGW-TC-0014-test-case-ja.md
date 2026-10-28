---
id: MGW-TC-0014
type: test-case
title: タイトル画面から始める
status: stable
version: 1.1
updated: 2026-10-28
sources:
  - MGW-US-0014（v1.1）
  - MGW-TST-0001（v1.2）
  - MGW-TD-0004（v1.0）
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
| MGW-TC-0014-03 | 3 | `#/title`・`#/play`・`#/ranking` のハッシュで画面が切り替わる | 自動（E2E） | `e2e/title.spec.ts` |
