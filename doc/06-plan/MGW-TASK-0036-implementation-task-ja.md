---
id: MGW-TASK-0036
type: implementation-task
title: タイトル画面の版とリリース 1.0.0
status: stable
version: 1.0
updated: 2026-10-30
sources:
  - MGW-WS-0014（v1.0）
  - MGW-TD-0001（v1.2）
  - MGW-TD-0004（v1.7）
  - MGW-TC-0014（v1.4）
  - MGW-ADR-0007（v1.2）
verified: null
---

# MGW-TASK-0036 タイトル画面の版とリリース 1.0.0

* **workstream**：MGW-WS-0014
* **ブランチ**：`feat/TASK-0036-release-1.0.0`
* **依存**：MGW-TASK-0035
* **実施記録**：attested-computation の同じ番号（0036）。作るのはこの TASK の PR。リリースの全体の手動テストの結果も同じ記録に書く
* **公開**：この PR のマージで 1.0.0 が公開される

## やること

- package.json・package-lock.json：`version` を `1.0.0` に
- vite.config.ts：`define` で `__APP_VERSION__` に `package.json` の `version` を埋め込む。`src/vite-env.d.ts` に型（MGW-TD-0004 §2.1）
- title.ts・style.css：HIGH の行の右端に `.title-version`（`v1.0.0`）
- README.md（新しく作る）：遊び方・公開 URL・1979 年の原作の再現を目的とした非公式の作品であることと原作の表記（MGW-ADR-0007）・クレジット・開発のコマンド・文書の置き場所

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-08 | MGW-US-0014 | HIGH の行の右端に `v` と `package.json` の版が出て、HIGH と重ならない | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。`node scripts/check-docs.mjs --strict` がエラー 0。
- 画面に関わる変更は、スマートフォンの幅（iPhone 11・iPhone SE）と PC で表示して確かめた。
- attested-computation（番号 0036、draft）に自動テストの結果を書き、同じ PR に入れた。リリースの全体の手動テストは、公開のあとに書く。
