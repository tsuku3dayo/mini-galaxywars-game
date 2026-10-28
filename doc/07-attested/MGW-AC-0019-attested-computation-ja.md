---
id: MGW-AC-0019
type: attested-computation
title: ランキングの書き出し・読み込みの確認
status: stable
version: 1.0
updated: 2026-10-28
sources:
  - MGW-TASK-0019（v1.0）
  - MGW-TC-0027（v1.0）
verified:
  by: tsuku3dayo
  at: 2026-10-28T15:32:44+09:00
---

# MGW-AC-0019 ランキングの書き出し・読み込みの確認

* **TASK**：MGW-TASK-0019（ブランチ `feat/TASK-0019-ranking-backup`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

E2E は 3 つの project（`pc-chromium`・`iphone11-webkit`・`iphonese-webkit`）で通った。

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0027-01 | 「書き出し」で、ランキングを JSON のファイルとして保存できる | OK | `✓` › e2e\ranking-backup.spec.ts › MGW-TC-0027-01。ファイル名は `mini-galaxywars-ranking-YYYYMMDD.json`（8 桁の日付）。中身は `{ app: "mini-galaxywars", version: 1, entries }` で、保存していた 2 件と同じ。2 文字の字下げ |
| MGW-TC-0027-02 | 「読み込み」で、書き出した JSON からランキングを戻せる | OK | `✓` › e2e\ranking-backup.spec.ts › MGW-TC-0027-02。書き出したあと別の記録（1 件）にしてから、書き出したファイルを選ぶと「今のランキングを置き換えます。よろしいですか？」が出る。「やめる」なら変わらず、「置き換える」で元の 2 件に戻る。読み込み直しても残る |
| MGW-TC-0027-04 | 形の違う JSON や、ほかのアプリの JSON（`app` が `mini-galaxywars` でない）は読み込まず、今の記録を変えない | OK | `✓` › e2e\ranking-backup.spec.ts › MGW-TC-0027-04。JSON でないもの、`app` が `other-app` のもの、名前が小文字のものを選ぶと、「このファイルは読み込めません」が出て、確認は出ない。一覧も localStorage の中身も変わらない |

そのほか（同じファイル）：「読み込めません」の知らせが出ても、10 件・書き出し・読み込み・TITLE がゲーム画面の枠に収まる（iPhone SE の高さでも）。

単体テストの合計：`Tests 77 passed (77)`。E2E の合計：`115 passed`、`17 skipped`。`npm run verify` も通った。

画面：iPhone SE の幅で、読み込めないときの知らせと、置き換えの確認のスクリーンショットを見た。はじめは知らせが出ると「TITLE」の下が枠から切れていたので、ランキング画面の余白と行の間を詰めた（上の E2E で確かめる）。詰めたあとも CI（Linux）ではフォントで行が少し高くなり、1 px はみ出して落ちたので、行の高さを決め打ちにした（一覧 18 px、そのほか 20 px）。手元の iPhone SE の幅で、TITLE の下から枠の下まで約 30 px あいている。

## 2. 手動の確認（WS-0006 の終わり、2026-10-28、オーナー、iPhone 11・PC）

この TASK に手動の確認 ID はない。公開 URL で、iPhone のホーム画面の本物の「GWミニ」と PC で次を見てもらい、すべて OK だった。

| 見たこと | 結果 |
| :--- | :--- |
| 「書き出し」でファイルを保存できる | OK（iPhone・PC） |
| 「読み込み」で書き出したファイルを選ぶと確認が出て、「置き換える」で戻る | OK（iPhone・PC） |

## 3. 設計と違う作りにしたこと

なし。MGW-GUI-0005・MGW-TD-0006 のとおりに作った。

- 置き換えの確認は、ブラウザの `confirm` ではなく、ランキング画面に重ねる表示（「置き換える」「やめる」）にした（ゲームの見た目に合わせ、E2E で確かめられるようにするため）。
- ランキング画面は、画面に入るたびに記録を読み直す。読めないときの知らせと確認は、そのとき消す。

## 4. 確認できなかったこと

- 形の違うファイルを選んだときの知らせは、実機では見ていない（E2E の 3 つの project で確かめた）。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
