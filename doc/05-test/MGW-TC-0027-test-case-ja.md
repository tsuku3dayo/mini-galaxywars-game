---
id: MGW-TC-0027
type: test-case
title: ランキングを書き出す・読み込む
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0027（v1.0）
  - MGW-TST-0001（v1.2）
  - MGW-TD-0006（v1.0）
verified: null
---

# MGW-TC-0027 ランキングを書き出す・読み込む

* **user-story**：MGW-US-0027
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0027-01 | 1 | 「書き出し」で、ランキングを JSON のファイルとして保存できる | 自動（E2E） | `e2e/ranking-backup.spec.ts` |
| MGW-TC-0027-02 | 2 | 「読み込み」で、書き出した JSON からランキングを戻せる | 自動（E2E） | `e2e/ranking-backup.spec.ts` |
| MGW-TC-0027-03 | 3 | 形の違う JSON や、ほかのアプリの JSON（`app` が `mini-galaxywars` でない）は読み込まず、今の記録を変えない | 自動（単体） | `tests/unit/ranking-store.test.ts` |
| MGW-TC-0027-04 | 3 | 形の違う JSON や、ほかのアプリの JSON（`app` が `mini-galaxywars` でない）は読み込まず、今の記録を変えない | 自動（E2E） | `e2e/ranking-backup.spec.ts` |
