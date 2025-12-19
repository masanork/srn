---
title: "IPAmj明朝、acgjm明朝のテスト"
font: 
  - "ipamjm.ttf"
  - "acgjm.ttf"
---

これはIPAmj明朝を使用したテストページです。
必要なグリフだけが埋め込まれるため、フォントファイル全体を読み込む必要はありません。

## IVSテスト (異体字セレクタ)

IPAmj明朝はIVSに対応しています。

- 辻󠄀 (U+8FBB U+E0100)
- 辻󠄃 (U+8FBB U+E0103)

## PUPテスト (複数フォント・PUP領域)

行政事務標準文字追加明朝によるPUP領域のテストです。

- 􍺒 (G+10DE92)

## Mermaidテスト

```mermaid
graph TD;
    A[辻󠄀] --> B[葛󠄀];
    B --> C[𠮷野家];
```