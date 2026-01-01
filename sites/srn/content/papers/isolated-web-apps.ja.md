---
title: "Isolated Web Apps (IWA) と Web/A"
date: 2026-01-01
description: "WebUSBなどの強力なAPI制限を解除できる次世代Webアプリフォーマット「Isolated Web Apps」についての技術解説。"
tags: ["tech", "security", "webusb", "civil"]
layout: paper
---

# Isolated Web Apps (IWA) とは

Isolated Web Apps (IWA) は、Webアプリケーションのセキュリティと機能性を大幅に強化するための新しいパッケージング形式です。これまでのPWA (Progressive Web Apps) とは異なり、アプリケーションのコード全体をユーザーのデバイス内に「隔離 (Isolate)」された状態で保存・実行します。

## なぜ IWA が必要なのか？

通常のWebアプリは、アクセスするたびにサーバーからコードを取得するため、開発者が意図せず（あるいは悪意を持って）コードを差し替えるリスクが常にあります。そのためブラウザは、`WebUSB` や `Direct Sockets` といった強力なAPIの利用に対して、非常に厳格な制限（今回遭遇した「Protected Interface Class」制限など）を設けています。

IWAは、**「署名されたパッケージ」** として配布され、インストール後はオフラインで動作し、勝手にコードが変更されることがありません。この高い信頼性を担保に、通常のWebページでは許可されない強力な権限が付与されます。

## Web/A Project との関係 (WebUSB制限の解除)

現在、SRNの **CIV (Civil Identity Verification)** デモにおいて、macOSやWindows上でICカードリーダー(CCID)にアクセスできない問題が発生しています。これはブラウザがセキュリティのためにCCIDクラスの利用をブロックしているためです。

IWAでは、マニフェストファイルに以下のような記述を行うことで、この制限を解除できます。

```json
"permissions_policy": {
  "usb-unrestricted": ["self"]
}
```

この `usb-unrestricted` 権限により、OSレベルでブロックされていない限り、システムドライバが関与するデバイスであっても直接アクセスが可能になる場合があります（※OS側の排他制御は依然として残りますが、ブラウザ側の「門前払い」は回避できます）。

## 技術的な特徴

1.  **独自のプロトコル**: `https://` ではなく `isolated-app://<app-id>/` スキームで動作します。
2.  **Web Bundle (Signed Web Bundles)**: アプリケーション全体が `.swbn` という単一のファイルにパッケージングされ、開発者の秘密鍵で署名されます。
3.  **更新の完全性**: アップデート時も署名の検証が行われ、サーバー側での改ざんや第三者によるコード 注入を防ぎます。

## 今後の展望

Web/A Form や CIV アプリケーションを IWA としてパッケージ化して配布することで、以下のメリットが想定されます。

-   **ネイティブアプリ不要**: Mac/Windowsユーザーにも、App Storeやexe配布なしで、ブラウザだけでICカード読み取り機能を提供できる。
-   **検閲耐性と永続性**: アプリ自体がローカルに保存されるため、Web/Aが目指す「永続的な文書とツール」の理念と合致します。

現在はまだ Chrome での開発者プレビュー段階ですが、Web/A Project としては、ネイティブアプリ（Electron/Tauri）への移行の前段階として、IWA を有力な選択肢として検証を続けます。
