---
id: MGW-ADR-0006
type: architecture-decision
title: TypeScript の版（6.0 系を使う）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - doc/specification.md (v1.7) §13
verified:
  by: tsuku3dayo
  at: 2026-10-26T15:48:01+09:00
---

# MGW-ADR-0006 TypeScript の版

## 状況

仕様書は TypeScript `~6.0.3` を指定している（§13）。2026-10-26 の時点で、最新は 7.0.2。
Lint に使う typescript-eslint（8.72.0）は、TypeScript `>=4.8.4 <6.1.0` にしか対応していない。

## 選択肢

1. 仕様書どおり `~6.0.3` を使う。
2. 7 系を使い、TypeScript の Lint をやめる（または対応を待つ）。

## 決定

選択肢 1。`typescript: ~6.0.3`、`strict: true`。

## 理由

- 仕様書と合っている。
- ESLint で層の決まり（MGW-ADR-0001）を守れる。

## 影響

- typescript-eslint が 7 系に対応したら、版を上げるかを変更の依頼として決める。
