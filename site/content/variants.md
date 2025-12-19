---
title: "Unihan 異体字コレクション"
layout: variants
description: "様々なタイプの異体字関係（意味、字形、IVS）をUnihan形式で一覧化するテストページ。"
font: 
  - ipamjm.ttf
  - NotoSansJP-Regular.otf
variants:
  # Semantic Variants (同義異字)
  - source: "凶"
    property: "kSemanticVariant"
    target: "兇"
    note: "JIS第1水準/第2水準"
  
  - source: "猫"
    property: "kSemanticVariant"
    target: "貓"
    note: "旧字体"

  # Z Variants (字形差)
  - source: "高"
    property: "kZVariant"
    target: "髙"
    note: "はしご高 (Legacy compatibility)"

  # IVS Variants (独自プロパティ例)
  - source: "葛"
    property: "kSrnsIVS"
    target: "葛󠄀"
    note: "E0100 (標準)"
  
  - source: "葛"
    property: "kSrnsIVS"
    target: "葛󠄂"
    note: "E0102 (ヒ)"
  
  - source: "辻"
    property: "kSrnsIVS"
    target: "辻󠄀"
    note: "E0100 (二点)"

  - source: "辻"
    property: "kSrnsIVS"
    target: "辻󠄂"
    note: "E0102 (一点)"
---

このページは、MarkdownのFrontmatterに記述されたトリプルデータ (`Source`, `Property`, `Target`) から生成されています。
ページ下部には、Unihan Databaseと同様の形式でエクスポートされたテキストデータがあります。
