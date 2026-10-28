---
id: MGW-AC-0025
type: attested-computation
title: ミサイルの噴射音の確認
status: draft
version: 1.0
updated: 2026-10-28
sources:
  - MGW-TASK-0025（v1.0）
  - MGW-TC-0023（v1.2）
verified: null
---

# MGW-AC-0025 ミサイルの噴射音の確認

* **TASK**：MGW-TASK-0025（ブランチ `feat/TASK-0025-jet-sound`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0023-01 | 加速噴射の間、ミサイルの噴射音（ノイズの「シュー」という音）が鳴る。噴射しないときは鳴らない | OK | `✓ tests/unit/sound-plan.test.ts > 音の計画 > MGW-TC-0023-01 …`。噴射を始めると `jetOn`、やめると `jetOff`。発射前・噴射したまま最上部を抜けたときも正しく止める。音色は `✓ tests/unit/synthesizer.test.ts > 音の合成（MGW-TD-0005） > 噴射音（MGW-TC-0023-01 の音色）…` で確かめた：オシレーターを使わず、くり返すノイズを帯域通過フィルター（1,200 Hz、Q 0.8）に通す。0.05 秒で音量 0.12 に上げ、`jetOff` で 0.08 秒かけて 0 に下げてから止める。重ねて鳴らさず、止めたあとは鳴らし直せる |

単体テストの合計：`Tests 83 passed (83)`。E2E の合計：`118 passed`、`17 skipped`。`npm run verify` も通った（`check:dist` で、音のファイルがなく Web Audio で合成していることも確かめている）。

画面：この TASK は画面を変えていない。

## 2. 手動の確認

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0023-02 | 噴射の間だけ、「シュー」という噴射音が鳴る | 未実施（WS の終わりに確かめる） |

## 3. 設計と違う作りにしたこと

なし。MGW-TD-0005 v1.1 のとおり。コードの説明の「ジェット音」を「噴射音」にそろえた。

## 4. 確認できなかったこと

- 音色そのものは自動では確かめられないので、WS の終わりに PC と iPhone で聞いてもらう。
- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
