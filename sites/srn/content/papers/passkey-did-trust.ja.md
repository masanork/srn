---
title: "討議資料：Passkey based DID Trust (did:web)"
layout: article
date: 2025-01-04
author: "Sorane Project"
description: "Passkey署名と did:web を組み合わせた発行者トラストの成立条件を整理し、最小デモの手順を示す。"
---

# 討議資料：Passkey based DID Trust (did:web)

本稿は **Passkey で署名した VC を Web に置けば「自分が発行した証明」になるのか** を整理し、最小構成で成立させるための条件とデモ手順をまとめる。

結論から言えば **「条件付きで Yes」** である。  
ただし証明できるのは **「そのドメインの管理者が発行した」** という事実であり、**「法的主体としての本人性」** までは自動的に保証されない。

---

## 1. 何が「証明」されるのか

Passkey 署名 + did:web が示すのは、次の2点である。

1. **署名鍵の所持（Passkey）**  
    → WebAuthn により、**デバイス上の秘密鍵の所持**を示せる。
2. **発行者のドメイン所有（did:web）**  
    → `https://<domain>/.well-known/did.json` を公開できるのは、**そのドメイン管理者**だけである。

したがって、

> 「Passkey で署名された VC が did:web を issuer に持ち、  
> その did.json が署名検証可能である」

ならば、**「そのドメイン管理者が発行した VC」** であることは証明できる。

ただし、それは **個人本人性の証明ではない**。  
本人性を担保したい場合は、JPKI 等の高信頼 ID で Passkey 登録を行う **初回オンボーディング**が必要となる。

---

## 2. 必須条件（成立条件）

次の条件を満たすときにのみ「発行者性」が成立する。

1. **VC の issuer が did:web である**  
    例: `did:web:masanork.github.io:srn`
2. **did.json に署名検証可能な公開鍵が存在する**  
    - Passkey の公開鍵、または  
    - Passkey によって委譲された Build Key の公開鍵
3. **VC の proof が did.json の鍵で検証可能である**
4. **did.json が HTTPS で取得される（WebPKI 信頼）**

### 重要ポイント

「VC を Web に置いた」だけでは成立しない。  
**did.json に公開鍵を結びつけて初めてトラストが成立する。**

---

## 3. 最小構成のアーキテクチャ

```
Passkey (Root) ──署名──> Delegate Certificate
                   │
                   ▼
         Build Key (短期鍵) ──署名──> VC
                   │
                   ▼
            did.json に公開鍵を公開
```

- **Passkey**: 最終的な Root of Trust  
- **Delegate Certificate**: Root が Build Key を承認した証明  
- **Build Key**: 自動ビルドが VC を署名するための鍵  

この設計により、**ハードウェア署名の安全性**と**自動ビルドの運用性**が両立する。

---

## 4. 最小デモ手順（Sorane）

> ※ PoC は Passkey を**シミュレーション鍵**で代用できる。

1. **Root / Delegate の生成**

   ```bash
   bun run src/tools/passkey-authorize.ts --site srn
   ```

2. **Web/A のビルド**

   ```bash
   bun run build:srn
   ```

3. **公開**
   - `dist/srn/.well-known/did.json` が did:web の信頼アンカーになる。
   - 署名済み VC を `dist/srn` 配下に配置する。

4. **検証**
   - VC の issuer DID を解決して `did.json` の公開鍵で検証する。

---

## 5. よくある誤解

### Q. VC を Web に置けば、それだけで「私が発行した」証明になる？

**No.**  
VC の署名が did.json の公開鍵と一致して初めて成立する。  
置き場所は単なる「配布経路」にすぎない。

### Q. Passkey 署名なら本人性も証明される？

**No.**  
Passkey は **「鍵を持つ端末の所持」** を証明する。  
本人性は **初回登録時の身元確認**に依存する。

---

## 6. srn / my-blog の DID について

GitHub Pages の場合、以下の DID が成立する。

- `did:web:masanork.github.io:srn`
- `did:web:masanork.github.io:my-blog`
