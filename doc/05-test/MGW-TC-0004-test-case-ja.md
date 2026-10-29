---
id: MGW-TC-0004
type: test-case
title: 起動に失敗しても直せる
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0004（v1.0）
  - MGW-TST-0001（v1.5）
  - MGW-TD-0007（v1.5）
verified: null
---

# MGW-TC-0004 起動に失敗しても直せる

* **user-story**：MGW-US-0004
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0004-01 | 1 | 8 秒たってもアプリが起動しないと、復旧の画面が出る | 自動（E2E） | `e2e/boot-recovery.spec.ts` |
| MGW-TC-0004-02 | 2 | 復旧の画面に「再読み込み」と「キャッシュを消して再読み込み」がある | 自動（E2E） | `e2e/boot-recovery.spec.ts` |
| MGW-TC-0004-03 | 3 | 「キャッシュを消して再読み込み」をしても、ランキング（`galaxy-wars-scores`）は消えない | 自動（E2E） | `e2e/boot-recovery.spec.ts` |
