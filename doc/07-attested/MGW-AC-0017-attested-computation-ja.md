---
id: MGW-AC-0017
type: attested-computation
title: ランキングの保存の確認
status: draft
version: 1.0
updated: 2026-10-28
sources:
  - MGW-TASK-0017（v1.0）
  - MGW-TC-0025（v1.0）
  - MGW-TC-0027（v1.0）
verified: null
---

# MGW-AC-0017 ランキングの保存の確認

* **TASK**：MGW-TASK-0017（ブランチ `feat/TASK-0017-ranking-store`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0025-02 | 記録するのは、スコア・プレイヤー名・日時 | OK | `✓ tests/unit/ranking-store.test.ts > ランキングの保存 > MGW-TC-0025-02 …`。保存した項目は `score`・`name`・`date` の 3 つだけ。名前は大文字にして保存し、日時はタイムゾーン付きの ISO 8601 で、登録した時刻を指す |
| MGW-TC-0025-03 | localStorage の `galaxy-wars-scores` に、スコアの高い順で上位 10 件だけを残す | OK | 同じく MGW-TC-0025-03。10 件をばらばらの順に足すと高い順に並ぶ。11 件目は、入らない点数なら `rankOf` が null、入る点数なら 10 件に切られていちばん低いものが落ちる。同じスコアなら先に登録した方が上。0 点は入らない |
| MGW-TC-0027-03 | 形の違う JSON や、ほかのアプリの JSON（`app` が `mini-galaxywars` でない）は読み込まず、今の記録を変えない | OK | 同じく MGW-TC-0027-03。JSON でない、`app`・`version` が違う、`entries` が配列でない・11 件以上、`score` が 0〜99,999 の整数でない、`name` が英大文字・数字・空白の 1〜8 文字でない、`date` が日時でない、の 18 とおりがすべて `{ ok: false }`。調べたあとも保存の中身は同じ |

そのほか（同じファイル）：保存が無い・壊れている・形が違うときと、localStorage が使えないときは空として扱い、保存はし直さない。書き出しは保存の形（2 文字の字下げ）で、書き出したものはそのまま読み込める。名前は入力のたびに大文字・英数字と空白だけ・8 文字までにし、登録のときに空なら `PLAYER`。

単体テストの合計：`Tests 77 passed (77)`。E2E の合計：`79 passed`、`17 skipped`。`npm run verify` も通った。

画面：この TASK は画面を変えていない（`src/storage/ranking-store.ts` を足しただけで、画面から使うのは MGW-TASK-0018）。

## 2. 手動の確認

この TASK に手動の確認 ID はない。

## 3. 設計と違う作りにしたこと

なし。MGW-TD-0006 §1 の関数のほかに、名前の決まり（§1.4）を `normalizeName`（入力のたび）と `finalizeName`（登録のとき）、日時の形を `toLocalIso` として出した。localStorage を読むときに例外が出たら（使えない設定のときなど）、空として扱う。

## 4. 確認できなかったこと

- 実際の localStorage への保存と、読み込み直しても残ることは、画面から使う MGW-TASK-0018 の E2E（MGW-TC-0025-04）で確かめる。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
