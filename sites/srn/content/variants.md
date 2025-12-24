---
title: "Unihan Variant Collection"
layout: variants
description: "A test page listing various types of character variants (Semantic, Glyph, IVS) in Unihan format."
font: GJM
variants:
  # Semantic Variants
  - source: "凶"
    items:
      - property: "kSemanticVariant"
        target: "兇"
        note: "JIS Level 1/Level 2"
  
  - source: "猫"
    items:
      - property: "kSemanticVariant"
        target: "貓"
        note: "Traditional/Old style"

  # Z Variants (Glyph difference)
  - source: "高"
    items:
      - property: "kZVariant"
        target: "髙"
        note: "Hashigo-Taka (Legacy compatibility)"

  # IVS Variants - Group "葛"
  - source: "葛"
    items:
      - property: "kSrnsIVS"
        target: "葛󠄀"
        note: "E0100 (Standard)"
      - property: "kSrnsIVS"
        target: "葛󠄂"
        note: "E0102 (Hi-type)"
  
  # IVS Variants - Group "辻"
  - source: "辻"
    items:
      - property: "kSrnsIVS"
        target: "辻󠄀"
        note: "E0100 (Double dot)"
      - property: "kSrnsIVS"
        target: "辻󠄂"
        note: "E0102 (Single dot)"
---

This page is generated from nested data structures (`Source` -> `Items[]`) defined in the Markdown frontmatter.
At the bottom of the page, text data exported in a flat format (`Source`, `Property`, `Target`)—similar to the Unihan Database—is available.
