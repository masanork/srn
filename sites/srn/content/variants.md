---
title: "Unihan 異体字コレクション"
layout: variants
description: "様々なタイプの異体字関係（意味、字形、IVS）をUnihan形式で一覧化するテストページ。"
font: GJM
variants:
  # Semantic Variants
  - source: "凶"
    items:
      - property: "kSemanticVariant"
        target: "兇"
        note: "JIS第1水準/第2水準"
  
  - source: "猫"
    items:
      - property: "kSemanticVariant"
        target: "貓"
        note: "旧字体"

  # Z Variants (字形差)
  - source: "高"
    items:
      - property: "kZVariant"
        target: "髙"
        note: "はしご高 (Legacy compatibility)"

  # IVS Variants - Grooup "葛"
  - source: "葛"
    items:
      - property: "kSrnsIVS"
        target: "葛󠄀"
        note: "E0100 (標準)"
      - property: "kSrnsIVS"
        target: "葛󠄂"
        note: "E0102 (ヒ)"
  
  # IVS Variants - Group "辻"
  - source: "辻"
    items:
      - property: "kSrnsIVS"
        target: "辻󠄀"
        note: "E0100 (二点)"
      - property: "kSrnsIVS"
        target: "辻󠄂"
        note: "E0102 (一点)"
---

このページは、MarkdownのFrontmatterに記述されたネスト構造データ (`Source` -> `Items[]`) から生成されています。
ページ下部には、Unihan Databaseと同様のフラット形式 (`Source` `Property` `Target`) でエクスポートされたテキストデータがあります。
