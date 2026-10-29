---
id: MGW-TD-0005
type: technical-design
title: audio の設計（Web Audio の合成）
status: stable
version: 1.2
updated: 2026-10-29
sources:
  - MGW-TD-0001（v1.1）
  - MGW-TD-0002（v1.7）
  - MGW-US-0023（v1.3）
  - MGW-US-0024（v1.0）
  - MGW-US-0034（v1.0）
  - doc/specification.md (v1.11) §3.1、§22
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
| `setEnabled(on: boolean)` | 効果音のオン・オフ（仕様書 v1.7）。オフにしたら、鳴っている噴射音をすぐ止める（0.08 秒で下げずに `stop`）。オフの間の `play` は何もしない |

音のファイルは使わない（仕様書 §22）。全体の音量は `GainNode`（0.3）でまとめる。

- オフの間も `AudioContext` は閉じず、`unlock` も効く（オンに戻したらすぐ鳴るように）。
- オフの間に `jetOn` が来ても鳴らさない。オンに戻したとき、噴射中でも噴射音は鳴らし直さない（次の `jetOn` から鳴る）。

## 2. 音色（仕様書 §22）

| 指示 | 作り方 |
| :--- | :--- |
| `jetOn`〜`jetOff`（ミサイルの噴射音） | ホワイトノイズ（決まった式の擬似乱数で作った 1 秒分をくり返す）を帯域通過フィルター（中心 1,200 Hz、Q 0.8）に通した「シュー」という音。`jetOn` で 0.05 秒かけて音量 0.12 に上げ、`jetOff` で 0.08 秒かけて 0 に下げて止める（仕様書 v1.6） |
| `ufoDestroyed` | ホワイトノイズ（0.4 秒）＋ のこぎり波を 120 Hz から 30 Hz へ指数で下げる。音量を 0.4 秒で 0 へ |
| `extend` | 三角波で 523 → 659 → 784 Hz を 0.12 秒ずつ。最後の音は 0.3 秒 |
| `miss` | ホワイトノイズを低域通過フィルター（400 Hz → 80 Hz）に通す。音量を 0.02 秒で上げ、0.8 秒で 0 へ |

- ノイズは、決まった式の擬似乱数（線形合同法）で作ったバッファーを使い回す。`Math.random` は使わない。

## 3. 確かめ方

- いつ・どの音を鳴らすかは、`core/sound-plan.ts` の単体テストで確かめる（MGW-TD-0002 §8）。
- `synthesizer.ts` は、`AudioContext` のまがいもの（モック）で、音の指示ごとに作るノードの種類・周波数を単体テストで確かめる。オフのときにノードを作らないこと、オフにしたら噴射音が止まることも確かめる。
- 音色そのものは、PC と iPhone で聞いて確かめる（手動）。

## 改訂履歴

| 版 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-10-26 | 初版 |
| 1.1 | 2026-10-28 | ミサイルの噴射音を、矩形波からノイズの「シュー」にする（仕様書 v1.6） |
| 1.2 | 2026-10-29 | 効果音のオン・オフ（`setEnabled`）を足す（仕様書 v1.7） |
