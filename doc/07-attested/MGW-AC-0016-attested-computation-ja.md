---
id: MGW-AC-0016
type: attested-computation
title: iPhone で音を有効にすることの確認
status: stable
version: 1.0
updated: 2026-10-27
sources:
  - MGW-TASK-0016（v1.0）
  - MGW-TC-0024（v1.0）
verified:
  by: tsuku3dayo
  at: 2026-10-27T18:20:13+09:00
---

# MGW-AC-0016 iPhone で音を有効にすることの確認

* **TASK**：MGW-TASK-0016（ブランチ `feat/TASK-0016-audio-unlock`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1（Chromium・WebKit）

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0024-02 | 音が鳴らせない状態でも、ゲームは止まらずに動く | OK（3 つの project） | `✓` › e2e\audio.spec.ts › MGW-TC-0024-02（2 件）。Web Audio がないとき、と、音を有効にできない（`resume` が失敗する）ときのそれぞれで、START で始め、噴射して UFO を 1 機倒して点が入り、そのあともステップが進む。`data-audio=unavailable` になり、ページのエラーは出ない。`--repeat-each=3` でも毎回通った |

- 最初の CI では、このテストが落ちた（100 点のはずが 250 点）。UFO を倒したあと噴射して進めた間に、ミサイルが上段の UFO にも当たっていた。上段の位置は、START からテスト用の入口で止めるまでの実際の時間で変わる。狙う UFO だけを残し、前提（生きている UFO は 1 機）を先に確かめる形に直した。残り 1 機の UFO は速く動いて当たる部位が変わるので、点数の決まった値ではなく「1 機倒して点が入った」ことを見る。

そのほか：`tests/unit/synthesizer.test.ts` で、`resume` が失敗しても投げずに `unavailable` になり、音を鳴らさないことを確かめた。

単体テストの合計：`Tests 70 passed (70)`。E2E の合計：`79 passed`、`17 skipped`。`npm run verify` も通った。

画面：この TASK は画面を変えていない。

## 2. 手動の確認（WS-0005 の終わり、2026-10-27、オーナー、iPhone 11・PC）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0024-01 | iPhone で、最初のタッチ（「START」など）のあとから音が鳴る | OK（消音スイッチを切った iPhone のホーム画面の本物の「GWミニ」で、START のあとからジェット音・破壊音・爆発音が聞こえた） |

- 版の切り替え：PR #36 をマージする前に、PC と iPhone で前の版を開いておいた。公開のあと、どちらも「更新」で切り替わった。

## 3. 設計と違う作りにしたこと

- 「START」の `click`・`Space` に加えて、プレイ中に触れたとき・キーを押したときも、音が止まっていれば有効にし直す（MGW-TD-0004 §7 は START だけ）。iPhone でアプリを裏に回すと音が止まることがあるのと、`#/play` をじかに開いたときにも音を出すため。
- `unlock` が失敗したときは、`state()` を `unavailable` にする（`data-audio=unavailable`。MGW-TD-0004 §7 のとおり）。

## 4. 確認できなかったこと

- 「START」で本当に音が有効になる（`data-audio=running`）ことは E2E では確かめられなかった。ヘッドレスの Chromium は `resume` しても `suspended` のまま、E2E の WebKit（Windows）には AudioContext がない。§2 の手動で、iPhone と PC で聞いて確かめた。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
