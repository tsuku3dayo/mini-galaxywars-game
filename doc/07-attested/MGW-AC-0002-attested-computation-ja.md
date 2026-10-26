---
id: MGW-AC-0002
type: attested-computation
title: GitHub Pages への公開の確認
status: draft
version: 1.0
updated: 2026-10-26
sources:
  - MGW-TASK-0002（v1.0）
  - MGW-TC-0001（v1.0）
verified: null
---

# MGW-AC-0002 GitHub Pages への公開の確認

* **TASK**：MGW-TASK-0002（ブランチ `feat/TASK-0002-pages-deploy`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、GitHub Actions

## 1. 自動テストの結果

この TASK に自動の確認 ID はない。手元で `npm run verify` が通ることを確かめた。

## 2. 手動の確認（WS-0001 の終わりに書く）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0001-01 | main へのマージのあと、Actions の Pages の実行が成功し、公開 URL を開くと新しい版になっている | 未実施（WS-0001 の終わりに確かめる） |
| MGW-TC-0001-03 | PC のブラウザと iPhone の Safari で公開 URL を開き、タイトル画面が出る | 未実施（WS-0001 の終わりに確かめる） |

## 3. 設計と違う作りにしたこと

- `ci.yml` は PR のときだけ動かし、main への push のあとの verify・e2e は `pages.yml` の中で行う（同じ確認を 2 回動かさないため）。MGW-TD-0007 §6 の表のとおり、main への push で verify・e2e・公開が動くことに変わりはない。

## 4. 確認できなかったこと

なし（手動の確認は §2 のとおり WS-0001 の終わりに行う）。
