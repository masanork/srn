---
title: "行政事務標準文字（検証用抜粋）"
layout: variants
description: |
  **デジタル庁公示（案）**
  
  デジタル社会形成基本法に基づき、行政事務において標準的に使用すべき文字（行政事務標準文字）を以下の通り例示する。
  本実装は、IPAmj明朝フォントの動的サブセット化技術を用い、Webブラウザ上での正確な再現性を検証したものである。
  
  ※ 以下の表における「Source」は検索用見出し、「Target」は規定される字形を示す。

font: 
  - ipamjm.ttf
variants:
  # 葛飾区の葛など
  - source: "葛"
    items:
      - property: "MJ009664"
        target: "葛"
        note: "U+845B"
      - property: "MJ009665"
        target: "葛󠄀"
        note: "U+845B U+E0100 (SVS)"
  
  # 芦屋市の芦など
  - source: "芦"
    items:
      - property: "MJ021959"
        target: "芦"
        note: "U+82A6"
      - property: "MJ021960"
        target: "芦󠄀"
        note: "U+82A6 U+E0100"

  # 辻（一点しんにょう・二点しんにょう）
  - source: "辻"
    items:
      - property: "MJ025556"
        target: "辻"
        note: "U+8FBB"
      - property: "MJ025557"
        target: "辻󠄂"
        note: "U+8FBB U+E0102"

  # 関連する異体字群の例
  - source: "辺"
    items:
      - property: "MJ025752"
        target: "辺"
        note: "U+8FBA"
      - property: "MJ025753"
        target: "辺󠄀"
        note: "U+8FBA U+E0100"
      - property: "MJ025776"
        target: "邉"
        note: "U+9089"
      - property: "MJ025777"
        target: "邉󠄀"
        note: "U+9089 U+E0100"
      - property: "MJ025785"
        target: "邊"
        note: "U+908A"
      - property: "MJ025786"
        target: "邊󠄀"
        note: "U+908A U+E0100"
---

本ページは `srn` (Static Site Generator) により、Markdownソースから自動生成されました。
各文字の字形は、システムフォントではなく、サーバーサイドでサブセット化された `IPAmjMincho` によって描画されています。
これにより、閲覧者のデバイス環境に依存せず、常に正しい「行政事務標準文字」の形状が保証されます。
