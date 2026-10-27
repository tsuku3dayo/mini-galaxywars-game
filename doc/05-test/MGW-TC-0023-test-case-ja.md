---
id: MGW-TC-0023
type: test-case
title: 効果音が鳴る
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0023（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.2）
  - MGW-TD-0005（v1.0）
  - MGW-TD-0007（v1.3）
verified: null
---

# MGW-TC-0023 効果音が鳴る

* **user-story**：MGW-US-0023
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0023-01 | 1 | 加速噴射の間、ミサイルの上昇音（ジェット音：矩形波 440 Hz → 880 Hz）が鳴る。噴射しないときは鳴らない | 自動（単体） | `tests/unit/sound-plan.test.ts` |
| MGW-TC-0023-02 | 1 | 加速噴射の間、ミサイルの上昇音（ジェット音：矩形波 440 Hz → 880 Hz）が鳴る。噴射しないときは鳴らない | 手動（iPhone・PC） | 噴射の間だけ、上がっていくジェット音が鳴る |
| MGW-TC-0023-03 | 2 | UFO を壊すと破壊音（ホワイトノイズ＋ 120 Hz → 30 Hz の低音）が鳴る | 自動（単体） | `tests/unit/sound-plan.test.ts` |
| MGW-TC-0023-04 | 2 | UFO を壊すと破壊音（ホワイトノイズ＋ 120 Hz → 30 Hz の低音）が鳴る | 手動（iPhone・PC） | UFO を壊すと、ノイズと低くなっていく音が鳴る |
| MGW-TC-0023-05 | 3 | 増機すると増機音（三角波 523 → 659 → 784 Hz のアルペジオ）が鳴る | 自動（単体） | `tests/unit/sound-plan.test.ts` |
| MGW-TC-0023-06 | 3 | 増機すると増機音（三角波 523 → 659 → 784 Hz のアルペジオ）が鳴る | 手動（iPhone・PC） | 3,000 点に届くと、3 つの音が上がっていく増機音が鳴る |
| MGW-TC-0023-07 | 4 | ミスすると爆発音（重低音のノイズ）が鳴る | 自動（単体） | `tests/unit/sound-plan.test.ts` |
| MGW-TC-0023-08 | 4 | ミスすると爆発音（重低音のノイズ）が鳴る | 手動（iPhone・PC） | ミスすると、低い爆発音が鳴る |
| MGW-TC-0023-09 | 5 | 音のファイルを使わず、Web Audio で合成する | 自動（dist の検査） | `scripts/check-dist.mjs` |
