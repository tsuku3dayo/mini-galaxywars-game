---
id: MGW-GUI-0008
type: gui-design
title: クレジット画面
status: stable
version: 1.1
updated: 2026-10-29
sources:
  - MGW-GUI-0001（v1.5）
  - MGW-US-0033（v1.1）
  - doc/specification.md (v1.11) §18
verified:
  by: tsuku3dayo
  at: 2026-10-29T15:03:15+09:00
---

# MGW-GUI-0008 クレジット画面（`#/credits`）

## 1. 配置（「ブロック崩しミニ」のクレジット画面と同じ形。紺の画面、MGW-GUI-0001 §5.1）

```
┌────────────────────────────────────┐
│ [← BACK]       クレジット            │
│                                    │
│             PRODUCER               │ ← 役割：小さく、うすい字、字の間を少しあける
│          つくだ よしはる            │ ← 名前：太字
│                                    │
│             DIRECTOR               │
│          つくだ よしはる            │
│                                    │
│           GAME DESIGNER            │
│          つくだ よしはる            │
│                                    │
│         GRAPHIC DESIGNER           │
│            CLAUDE CODE             │
│                                    │
│           SOUND CREATOR            │
│            CLAUDE CODE             │
│                                    │
│            PROGRAMMER              │
│            CLAUDE CODE             │
└────────────────────────────────────┘
```

## 2. 部品

| 部品 | 文言 | 動き | US |
| :--- | :--- | :--- | :--- |
| 戻る | ← の印と「BACK」 | `#/title` へ | MGW-US-0033 |
| 見出し | クレジット | 画面の中央 | MGW-US-0033 |
| 役割と名前 | 上の 6 組。役割は 14 pt のうすい字（`#8C96AD`）、名前は 20 pt の太字（`#E6EAF2`）。中央にそろえる | — | MGW-US-0033 |
| 更新の案内 | MGW-GUI-0007 | 新しい版があるときだけ | MGW-US-0003 |

## 3. メモ

- iPhone SE の高さで収まらないときは、枠の中でスクロールする（ページ全体はスクロールさせない）。
- 原作の表記（非公式の作品であること・原作の権利者）は README に書く（MGW-ADR-0007）。クレジット画面には出さない（「ブロック崩しミニ」と同じ 6 行にする）。
