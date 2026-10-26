---
id: MGW-AC-0001
type: attested-computation
title: プロジェクトの骨組みと CI の確認
status: draft
version: 1.0
updated: 2026-10-26
sources:
  - MGW-TASK-0001（v1.0）
  - MGW-TC-0030（v1.0）
  - MGW-TC-0001（v1.0）
verified: null
---

# MGW-AC-0001 プロジェクトの骨組みと CI の確認

* **TASK**：MGW-TASK-0001（ブランチ `feat/TASK-0001-scaffold`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、npm 11.3.0

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0030-04 | ゲームのルール（src/core）が DOM・時刻・乱数を使っていない | OK | `npx vitest run`：`✓ tests/unit/layer-rules.test.ts > 層の決まり > MGW-TC-0030-04 ゲームのルール（src/core）が DOM・時刻・乱数を使っていない`（Tests 1 passed (1)） |

そのほか手元で通したもの：

- `npm run verify`：lint（エラー 0）、単体テスト（1 passed）、build（`tsc --noEmit` と `vite build`）、`check:dist`（エラー 0 件）、`check:docs`（エラー 0 件）
- `npm run test:e2e`：テストはまだない（`--pass-with-no-tests`）。preview のサーバーが起動し、終了コード 0
- CI（PR #9）：verify（24 秒）・e2e（42 秒）ともに成功

## 2. 手動の確認（WS-0001 の終わりに書く）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0001-02 | PR の画面に verify と e2e の結果が出る。失敗したものはマージの前に赤で分かる | 未実施（WS-0001 の終わりに確かめる） |

## 3. 設計と違う作りにしたこと

- ESLint の typescript-eslint は、型を使わない推奨の規則にした。MGW-TD-0007 を v1.1 に直した（§8）。
- CI の e2e は、Playwright のコンテナ（`mcr.microsoft.com/playwright:v1.64.1-noble`）で動かす。最初の形（`npx playwright install --with-deps chromium webkit`）は、ブラウザを入れる手順が 20 分を超えても終わらなかったため止めた。MGW-TD-0007 v1.1 §6 に書いた。
- `test:e2e` に `--pass-with-no-tests` を付けた。E2E のテストが 1 つもない間も CI の e2e ジョブを通すため。最初の E2E を足す MGW-TASK-0003 で外し、MGW-TS-0001 §3 のとおり `playwright test` に戻す。

## 4. 確認できなかったこと

なし（手動の確認は §2 のとおり WS-0001 の終わりに行う）。
