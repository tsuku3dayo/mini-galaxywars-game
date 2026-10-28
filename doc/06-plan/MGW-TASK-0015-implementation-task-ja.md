---
id: MGW-TASK-0015
type: implementation-task
title: 音の計画と合成
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0005（v1.2）
  - MGW-TD-0002（v1.4）
  - MGW-TD-0005（v1.1）
  - MGW-TC-0019（v1.2）
  - MGW-TC-0023（v1.2）
verified: null
---

# MGW-TASK-0015 音の計画と合成

* **workstream**：MGW-WS-0005
* **ブランチ**：`feat/TASK-0015-sound`
* **依存**：MGW-TASK-0009
* **実施記録**：attested-computation の同じ番号（0015）。作るのはこの TASK の PR

## やること

- core/sound-plan.ts、audio/synthesizer.ts、loop.ts から鳴らす

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0019-04 | MGW-US-0019 | 増えたときに増機音が鳴る（音は MGW-US-0023） | 自動（単体） |
| MGW-TC-0023-01 | MGW-US-0023 | 加速噴射の間、ミサイルの上昇音（ジェット音：矩形波 440 Hz → 880 Hz）が鳴る。噴射しないときは鳴らない | 自動（単体） |
| MGW-TC-0023-02 | MGW-US-0023 | 加速噴射の間、ミサイルの上昇音（ジェット音：矩形波 440 Hz → 880 Hz）が鳴る。噴射しないときは鳴らない | 手動（iPhone・PC） |
| MGW-TC-0023-03 | MGW-US-0023 | UFO を壊すと破壊音（ホワイトノイズ＋ 120 Hz → 30 Hz の低音）が鳴る | 自動（単体） |
| MGW-TC-0023-04 | MGW-US-0023 | UFO を壊すと破壊音（ホワイトノイズ＋ 120 Hz → 30 Hz の低音）が鳴る | 手動（iPhone・PC） |
| MGW-TC-0023-05 | MGW-US-0023 | 増機すると増機音（三角波 523 → 659 → 784 Hz のアルペジオ）が鳴る | 自動（単体） |
| MGW-TC-0023-06 | MGW-US-0023 | 増機すると増機音（三角波 523 → 659 → 784 Hz のアルペジオ）が鳴る | 手動（iPhone・PC） |
| MGW-TC-0023-07 | MGW-US-0023 | ミスすると爆発音（重低音のノイズ）が鳴る | 自動（単体） |
| MGW-TC-0023-08 | MGW-US-0023 | ミスすると爆発音（重低音のノイズ）が鳴る | 手動（iPhone・PC） |
| MGW-TC-0023-09 | MGW-US-0023 | 音のファイルを使わず、Web Audio で合成する | 自動（dist の検査） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0015、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
