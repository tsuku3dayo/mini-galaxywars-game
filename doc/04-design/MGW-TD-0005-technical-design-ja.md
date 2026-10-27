---
id: MGW-TD-0005
type: technical-design
title: audio の設計（Web Audio の合成）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-TD-0001（v1.0）
  - MGW-TD-0002（v1.2）
  - MGW-US-0023（v1.0）
  - MGW-US-0024（v1.0）
  - doc/specification.md (v1.4) §3.1、§22
verified: null
---

# MGW-TD-0005 audio の設計

## 1. 関数（`synthesizer.ts`）

| 関数 | 中身 |
| :--- | :--- |
| `createSynthesizer(): Synthesizer` | `AudioContext` を作る（作れなければ何もしない作り） |
| `unlock(): Promise<void>` | `resume()`。iPhone では、最初のタッチの中で呼ぶ |
| `play(commands: SoundCommand[])` | `jetOn`・`jetOff`・`ufoDestroyed`・`extend`・`miss` を鳴らす |
| `state(): 'running' \| 'suspended' \| 'unavailable'` | data 属性用 |

音のファイルは使わない（仕様書 §22）。全体の音量は `GainNode`（0.3）でまとめる。

## 2. 音色（仕様書 §22）

| 指示 | 作り方 |
| :--- | :--- |
| `jetOn`〜`jetOff`（ミサイルの上昇音・ジェット音） | 矩形波。周波数を 440 Hz から 880 Hz へ 0.3 秒で上げ、これをくり返す（`jetOff` まで）。音量 0.15 |
| `ufoDestroyed` | ホワイトノイズ（0.4 秒）＋ のこぎり波を 120 Hz から 30 Hz へ指数で下げる。音量を 0.4 秒で 0 へ |
| `extend` | 三角波で 523 → 659 → 784 Hz を 0.12 秒ずつ。最後の音は 0.3 秒 |
| `miss` | ホワイトノイズを低域通過フィルター（400 Hz → 80 Hz）に通す。音量を 0.02 秒で上げ、0.8 秒で 0 へ |

- ノイズは、決まった式の擬似乱数（線形合同法）で作ったバッファーを使い回す。`Math.random` は使わない。

## 3. 確かめ方

- いつ・どの音を鳴らすかは、`core/sound-plan.ts` の単体テストで確かめる（MGW-TD-0002 §8）。
- `synthesizer.ts` は、`AudioContext` のまがいもの（モック）で、音の指示ごとに作るノードの種類・周波数を単体テストで確かめる。
- 音色そのものは、PC と iPhone で聞いて確かめる（手動）。
