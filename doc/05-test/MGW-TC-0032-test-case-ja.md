---
id: MGW-TC-0032
type: test-case
title: ランキングを全部消す
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-US-0032（v1.0）
  - MGW-TST-0001（v1.3）
  - MGW-TD-0004（v1.2）
  - MGW-TD-0006（v1.1）
verified: null
---

# MGW-TC-0032 ランキングを全部消す

* **user-story**：MGW-US-0032
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0032-01 | 1 | タイトル画面に「ランキング消去」のボタンがある | 自動（E2E） | `e2e/ranking-clear.spec.ts` |
| MGW-TC-0032-02 | 2 | 押すと「ランキングをすべて消します。元に戻せません。よろしいですか？」と出て、「消す」で全部消え、「やめる」では何も変わらない | 自動（単体） | `tests/unit/ranking-store.test.ts` |
| MGW-TC-0032-03 | 2 | 押すと「ランキングをすべて消します。元に戻せません。よろしいですか？」と出て、「消す」で全部消え、「やめる」では何も変わらない | 自動（E2E） | `e2e/ranking-clear.spec.ts` |
| MGW-TC-0032-04 | 3 | 消したあと、タイトルの HIGH は `00000` になり、ランキング画面は記録がないときの表示になる | 自動（E2E） | `e2e/ranking-clear.spec.ts` |
| MGW-TC-0032-05 | 4 | 記録がないときに押すと、「記録がありません」と出る | 自動（E2E） | `e2e/ranking-clear.spec.ts` |
| MGW-TC-0032-06 | 5 | 設定（表示方式・効果音）は消えない | 自動（単体） | `tests/unit/ranking-store.test.ts` |
