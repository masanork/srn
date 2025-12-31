---
title: "Web/Aによる本質的デジタル変革の可能性"
layout: article
author: "Gemini 3 (DeepResearch)"
date: 2025-12-31
description: "「2025年の崖」とシステム間連携の隘路に対するWeb/Aの解決能力に関する包括的分析。"
ai_generated: true
---

# **Web/Aアーキテクチャによる本質的デジタル変革の可能性：2025年の崖、システム間連携の隘路、およびアナログ慣習の打破に向けた包括的分析**

## **1\. 序論：日本におけるデジタル敗戦の構造的要因と「2025年の崖」**

### **1.1 デジタル化の停滞と構造的疲労**

現在、日本の行政および民間システムのデジタル化を巡る議論は、極めて重大な岐路に立たされている。経済産業省が警鐘を鳴らす「2025年の崖」は、単なる古いコンピュータシステムの更新問題を指すものではない。それは、過去数十年にわたり日本企業と行政機関が最適化してきた「密結合」なシステムアーキテクチャが、デジタルトランスフォーメーション（DX）が求めるスピードと柔軟性に対して完全に不適合を起こしているという、構造的な危機を意味している1。これまで日本のシステム構築は、個別の業務プロセスを極限まで効率化するために、特定のベンダーによる高度なカスタマイズ（スクラッチ開発）を前提としてきた。この結果、システム内部のロジックは複雑怪奇なブラックボックスと化し、その維持管理にIT予算の8割以上が費やされる「守りのIT」への埋没を招いている1。

### **1.2 本報告書の目的と分析の視座**

本報告書は、デジタル庁統括官などを歴任した楠正憲氏らが提唱・示唆する「Web/A（Web of Agents / Agentic Web）」および「SRN（Semantic Resource Network）」という新たなアーキテクチャ概念3が、この膠着状態を打破する鍵となり得るかを包括的に分析するものである。特に、ユーザーから提起された以下の課題点に対し、Web/Aが技術的かつガバナンス的にどのような解決策を提示できるかを検証する。

1. **システム間連携の隘路（ボトルネック）：** なぜ日本のシステムはつながることにこれほどコストがかかるのか。  
2. **仕様刷新のデッドロック：** 更改時期の異なるシステム同士が互いに足を引っ張り合い、全体の進化を止めてしまう「すくみ」の構造。  
3. **システム経費の高騰と硬直性：** 多重下請け構造と人月商売が生み出す高コスト体質。  
4. **アナログ慣習の残存：** なぜデジタル化が進んでもFax、紙、Excelバケツリレー、そしてPPAP（パスワード付きZIP）がなくならないのか。

本分析では、Web/Aを単なる技術仕様としてではなく、信頼の起点（トラストアンカー）を「組織・場所」から「データ・主体」へと移転させる「アーキテクチャのコペルニクス的転回」として捉え、その潜在能力と実装上の障壁を詳らかにする。

## ---

**2\. 現状分析：システム間連携の隘路と「密結合」の呪縛**

Web/Aの有用性を論じる前に、なぜ現在の日本のシステムがこれほどまでに連携を苦手としているのか、その病理を解剖する必要がある。根本的な原因は、システム間の接続が「密結合（Tight Coupling）」によって設計されている点にある。

### **2.1 全銀システムに見る「固定長電文」の限界と高コスト構造**

日本のシステム間連携の硬直性を象徴するのが、全国銀行データ通信システム（全銀システム）である。1973年の稼働以来、日本の決済インフラを支えてきたこのシステムは、極めて高い信頼性を誇る一方で、そのアーキテクチャは「固定長電文」というレガシーな通信プロトコルに依存している5。

#### **2.1.1 1バイトの変更が招く数千億円の社会的コスト**

固定長電文では、「先頭から10バイト目までが銀行コード」「次の20バイトが口座番号」といった具合に、データの意味がその「位置（バイト数）」によって厳格に定義されている。この設計において、例えば国際送金規格（ISO20022）に対応するために「受取人名」のフィールドを拡張しようとすれば、システムに接続している全金融機関（約1,100機関）が、一斉に自行のシステムを改修しなければならない7。  
これが「更改時期の異なるシステムが足を引っ張り合う」典型的なメカニズムである。ある銀行が先進的なXML形式を取り入れたくても、通信相手である他の銀行や全銀センターの仕様が旧来のままであれば、通信は成立しない。結果として、業界全体が「最も遅れているシステム」の仕様に合わせざるを得なくなる。システム刷新には全参加者が足並みを揃える「一斉移行（ビッグバン移行）」が必須となり、その調整コストとリスク対策費は天文学的な数字に膨れ上がる5。これがシステム経費の高騰を招く主要因の一つである。

### **2.2 地方自治体システムにおける「ベンダーロックイン」とデータ連携の欠如**

行政システムにおいても同様の現象が見られる。日本には約1,700の自治体が存在するが、住民記録や税務などの基幹システムは、長らく大手ベンダーによる個別のパッケージやスクラッチ開発に依存してきた。

#### **2.2.1 「方言」だらけのデータベース**

これらのシステムでは、データの持ち方（スキーマ）がベンダーごとにバラバラである。ある自治体のシステムでは「氏名」が一つのフィールドに入っているが、隣の自治体では「氏」と「名」に分かれている、あるいは「外字」の扱いが異なるといった差異（方言）が無数に存在する。  
この状態でシステム間連携を行おうとすると、A市とB市のデータを翻訳するための「変換プログラム」を個別に開発しなければならない。これを1,700自治体×N種類の業務で掛け合わせると、連携パターンは爆発的に増加し、その維持管理コスト（インターフェース保守費）だけでIT予算が圧迫される。これが「システム間連携の隘路」の実体である1。

### **2.3 更改サイクルの非同期性が生む「仕様凍結」**

ユーザーの指摘する「更改時期の異なるシステム」の問題は、公共調達の構造的問題に起因する。自治体や企業のシステムは、通常5年から7年のリース契約や保守契約に基づいて運用される。  
システムA（2023年更新）とシステムB（2026年更新）が連携している場合を想定する。2024年に新しいデータ標準（例えば、デジタル庁が定めるベース・レジストリの仕様）が策定されたとする。システムAは更新直後であるため、次の更新（2028年）まで大規模な改修予算がつかない。一方、システムBは2026年の更新時に新仕様を取り入れようとするが、連携相手のシステムAが旧仕様のままであるため、結局システムBも旧仕様（互換モード）で構築せざるを得なくなる。  
このように、互いの更新サイクルが同期していないために、常に「古い仕様」が温存され続ける力学が働く。この「負のラチェット効果」こそが、日本がいつまでもレガシーシステムから脱却できない最大の要因である1。

## ---

**3\. アナログ慣習の正体：なぜPPAPとFaxは死なないのか**

デジタル化を阻むもう一つの壁は、PPAP（パスワード付きZIPファイル送信）やFax、Excelバケツリレーといったアナログ・擬似デジタル慣習の残存である。これらは単なる怠慢ではなく、現在のITシステムが「信頼（Trust）」を扱う機能を欠落させているがゆえに、現場が生み出した「苦肉の策」として理解する必要がある。

### **3.1 PPAP：セキュリティごっことしての儀式**

PPAPは、メールに添付したZIPファイルのパスワードを、同じ経路（メール）で別送するという慣習である。セキュリティの専門家からは「通信経路が盗聴されればファイルもパスワードも盗まれるため無意味」「マルウェア検査をすり抜けるためむしろ危険」と断じられている9。  
しかし、なぜこれほど強固に残存したのか。それはPPAPが「セキュリティ対策」ではなく、「免責の儀式」として機能していたからである。送信者は「鍵をかける」という行為によって「機密情報であること」を示し、受信者はその鍵を開ける手間によって「機密を受け取った」と認識する。現在のメールプロトコルには、このような「機密性の相互確認」を行う標準機能が存在しないため、PPAPという不完全なプロトコルがその代用品として定着してしまったのである。

### **3.2 Faxと紙：タンジブルな「原本性」への依存**

Faxがなくならない理由も同様である。電子メールの受信確認は法的な証拠能力が曖昧だが、Faxの送信レポートは「送信した事実」の物理的な証拠として商習慣上広く認められてきた11。また、請求書や契約書における「ハンコ（押印）」は、その書類が改ざんされていないこと（完全性）と、権限ある者が作成したこと（真正性）を担保する、長年の信頼インフラであった。  
既存のWebシステムやメールは、この「ハンコ」に相当する強固な信頼証明（Trust）を、誰もが簡単に使える形で提供できていない。PDFに電子署名を付与する仕組みはあるが、設定が煩雑であったり、専用のソフトが必要であったりと、Faxの「紙を入れてボタンを押すだけ」というUX（ユーザー体験）には遠く及ばない。ゆえに、現場はデジタルデータをわざわざ紙に印刷し、ハンコを押し、Faxで送るというプロセスに回帰する。

### **3.3 Excelバケツリレーとデータの死**

システムがつながらない結果、人間がその隙間を埋めるためにExcelが多用される。基幹システムからCSVをダウンロードし、Excelで加工し、別のシステムに入力用データとしてアップロードする。この過程で、データは「システム上の意味（メタデータ）」を剥奪され、単なる「セルの値」となる。これが「Excelバケツリレー」である。  
ここで発生するのは、転記ミスや計算式の誤りといったオペレーションリスクだけではない。データの「出自（Provenance）」が失われることが最大の問題である。その数値がいつ、誰によって、どのようなロジックで算出されたのかという情報が欠落するため、データの信頼性が著しく低下する。

## ---

**4\. Web/Aアーキテクチャの理論と構造：「疎結合」への転換**

以上の現状分析を踏まえ、楠正憲氏らが提唱するWeb/A（Web of Agents）およびSRN（Semantic Resource Network）の概念が、これらの課題をどのように解決し得るかを分析する。Web/Aの本質は、システム間の結合度を極限まで下げる「意味的疎結合（Semantic Loose Coupling）」と、信頼の起点を通信路からデータそのものに移す「データ中心型トラスト」にある。

### **4.1 Web/Aを構成する三つの技術的支柱**

Web/Aは単一の製品ではなく、以下の要素技術を組み合わせたアーキテクチャ・スタイルであると推察される3。

#### **4.1.1 Semantic WebとJSON-LD（意味の自己記述）**

従来のシステム連携（全銀システムやREST API）では、データの意味は「仕様書（ドキュメント）」によって外部で定義されていた。これに対し、Web/AではJSON-LD（Linked Data）等の技術を用い、データそのものに意味定義（コンテキスト）を含ませる13。  
例えば、単に {"price": 1000} と送るのではなく、{"@context": "http://schema.org/", "price": "1000", "priceCurrency": "JPY"} のように、ウェブ上の標準的な語彙（オントロジー）へのリンクを含めてデータを記述する。これにより、受け手側のシステム（エージェント）は、事前のすり合わせなしにデータの意味を解釈することが可能になる。

#### **4.1.2 Verifiable Credentials（検証可能なデータ）**

Web/Aにおける「信頼」は、VPNや閉域網といった「線の信頼」ではなく、\*\*Verifiable Credentials（VC）\*\*を用いた「点の信頼」によって担保される15。  
VCは、発行元（Issuer）が電子署名を付与したデジタル証明書であり、データの持ち主（Holder）がそれを検証者（Verifier）に提示するモデルをとる。これにより、データは特定のサーバーやプラットフォームから切り離されても、その真正性を失わない。これは、紙の証明書が封筒から出されても有効であるのと同様の性質を、デジタル空間で実現するものである。

#### **4.1.3 Autonomous Agents（自律エージェント）**

「Web of Agents」の名の通り、このアーキテクチャの主役は人間ではなくソフトウェア・エージェントである。エージェントは、SRN（意味的リソースネットワーク）を巡回し、必要なデータを発見、検証、交換する役割を担う12。  
従来、API連携のためには人間が仕様書を読み解き、コードを書く必要があった。Web/Aでは、エージェント同士が「私はこの語彙（Vocabulary）を理解できる」「私はこの証明書（VC）を要求する」といった情報を交換し（ネゴシエーション）、動的に連携パスを確立する。

### **4.2 「仕様の刷新」を妨げないメカニズム：Asynchronous Evolution**

Web/Aがもたらす最大のパラダイムシフトは、システム連携における\*\*「非同期的な進化（Asynchronous Evolution）」\*\*の実現である。

従来のAPI連携（SOAPや固定長電文）は「契約（コントラクト）」に基づく連携であった。契約書（仕様書）の一文字でも変われば、契約違反（エラー）となり通信は遮断される。これが「足を引っ張り合う」原因であった。  
一方、JSON-LDを用いたWeb/Aの連携は「理解に基づく」連携である。  
**【シナリオ分析：税制改正によるフィールド追加】**

* **現状：** 税システムAが「インボイス番号」という新項目を追加する。これを受け取る自治体システムBは、仕様書通りでないデータが来たためエラーを吐いて停止する。AはBの改修が終わるまで新項目を送れない。  
* **Web/A：** 税エージェントAは、標準語彙を用いて invoiceNumber を追加したJSON-LDを送出する。自治体エージェントBは、自分の知識ベース（オントロジー）に invoiceNumber がないため、**その項目だけを無視し**、従来の項目（氏名、税額など）だけを処理する（これを「Partial Understanding」と呼ぶ）。  
* **結果：** システムAはシステムBの改修を待たずに仕様をアップデートできる。システムBは、自身の更改時期が来たときに invoiceNumber に対応すればよい。これにより、**異なる更改サイクルのシステムが共存しながら、個別に進化していくこと**が可能になる18。

### **4.3 「Excelバケツリレー」の解消：SRNによるデータ流通**

SRN（Semantic Resource Network）構想では、データはシステムの外に出ても、その意味（メタデータ）と信頼（署名）を保持し続ける4。  
従来のCSVダウンロードでは、ファイルになった瞬間に「これは何のデータか」という情報が失われていた。SRNにおいては、エクスポートされたデータもJSON-LD+VCの形式をとる。これをExcel（に対応したエージェント）で開けば、各カラムの意味は保持され、変更履歴も署名として残る。  
さらに、これを別のシステムにインポートする際も、人間がカラムのマッピング（「A列は氏名、B列は住所...」）をする必要はない。エージェントがタグを読み取り、「http://imi.go.jp/ns/core/2/氏名 はこちらのシステムの Name フィールドに対応する」と自動判断して取り込むことができる。これにより、Excelを介在させつつも、データの分断を防ぐことが可能になる。

## ---

**5\. 分析：Web/Aは日本の課題を打破できるか**

ここでは、ユーザーが提示した具体的な課題に対し、Web/Aアーキテクチャがどのような解決能力を持つかを詳細に分析する。

### **5.1 システム間連携の隘路とコスト増強の解決能力**

**【分析結果：極めて高い潜在能力を有するが、オントロジー整備が前提】**

Web/Aは、連携コストの構造を「N対Nの個別開発」から「標準語彙へのマッピング」へと転換させることで、劇的なコストダウンを可能にする潜在能力がある。

* **現状（個別最適の罠）：** AシステムとBシステムをつなぐために、専用の変換プログラム（インターフェース）を開発する。システムがN個あれば、連携の組み合わせはNの二乗に比例して増大する。これが「スパゲッティ状態」を生み、維持コストを高騰させている。  
* **Web/A（標準化と自律化）：** 各システムは、内部データ形式を隠蔽し、外部に対しては「標準オントロジー（例：IMI共通語彙基盤）」に基づいたJSON-LDで対話する。エージェントがその翻訳を担うため、相手システムごとの個別開発が不要になる。

**表1：連携コスト構造の比較**

| 項目 | 現状（レガシー連携） | Web/A（セマンティック連携） | 効果 |
| :---- | :---- | :---- | :---- |
| **連携方式** | ポイント・ツー・ポイント（1対1） | セマンティック・ハブ（多対多） | インターフェース数の激減 |
| **データ定義** | システムごとの独自仕様（方言） | 標準語彙（JSON-LD）への参照 | マッピング作業の自動化 |
| **仕様変更** | 相手方システムの同時改修必須 | 後方互換性を維持しつつ拡張可能 | 改修の連鎖（波及）を遮断 |
| **開発主体** | 人間（SIer）によるコーディング | エージェントによる推論・解決 | **人月コストの削減** |

しかし、この実現には「全システムが合意できる共通語彙（オントロジー）」の整備が不可欠である。デジタル庁が進める「ベース・レジストリ」やデータ標準化がその基盤となるが、その整備が遅れれば、エージェントは「言葉の通じない外国人」同士となり、連携は機能しない20。

### **5.2 アナログ慣習（Fax・PPAP）の打破能力**

**【分析結果：代替手段ではなく「上位互換」としての機能により打破可能】**

Web/Aは、FaxやPPAPが担っていた「信頼の機能」を、デジタルネイティブな技術で代替・強化することで、これらを過去の遺物へと追いやる力を持つ。

* PPAPの打破（eシールとVC）：  
  企業の総務担当者が請求書を送るシーンを想定する。Web/A環境では、担当者はファイルをZIP圧縮するのではなく、自社の「eシール（組織の電子署名）」を付与して相手のエージェントに送信する。  
  受信側のエージェントは、受け取ったデータの電子署名を検証し、「確かに〇〇株式会社が発行し、改ざんされていないデータである」ことを瞬時に確認する。パスワードの別送などという無意味な儀式は不要となる。このプロセスは、メールソフトや業務アプリの裏側で自動的に行われるため、ユーザーの手間はPPAPより大幅に減る21。  
* Faxの打破（到達証明と原本性）：  
  Faxが好まれる「届いたかどうかが紙でわかる」という点は、Web/A上のトランザクションログ（ブロックチェーンや分散台帳技術と組み合わせることも可能）によって、より確実な「到達証明」として提供される。さらに、紙の原本性よりも強力な暗号学的原本性が付与されるため、法的な証拠能力においてもFaxを凌駕する。

### **5.3 「更改時期の異なるシステム」問題への解**

**【分析結果：疎結合アーキテクチャこそが唯一の解】**

前述の通り、全銀システムや自治体システムの硬直性は「密結合」に起因する。Web/Aの「疎結合（Loose Coupling）」アーキテクチャは、この問題を解決する理論的に最も整合性のあるアプローチである。  
楠氏がかつて関与した「GIGAスクール構想」などのプロジェクト23でも見られるように、教育現場では多様なデバイスやアプリが混在することを前提とした標準化が進められた。これと同様に、行政・金融システムにおいても「仕様の完全一致」を求めず、「解釈可能な部分のみを処理する」というWeb/Aのアプローチを導入することで、システム更改のタイミングを切り離す（デカップリング）ことができる。  
これにより、予算のある自治体から順次システムをモダナイズし、全体の底上げを図るという「段階的移行」が可能になる。これは、2025年の崖を一気に飛び越えるのではなく、安全な橋を架けるアプローチと言える。

## ---

**6\. 実装への課題と提言：技術を超えた変革**

Web/Aのコンセプトは、日本の抱える課題に対して極めて有効な処方箋であるが、その実装には技術的課題以上に、組織的・法的な高い障壁が存在する。

### **6.1 「人月商売」との決別**

Web/Aが普及すれば、これまで「データ変換プログラム」や「帳票修正」で稼いできたSIer（システムインテグレーター）の仕事は激減する。多重下請け構造（ITゼネコン）に支えられた日本のIT産業にとって、これは破壊的な変化である。既存ベンダーからの強い抵抗、あるいは「Web/A対応」と称して過剰に複雑な独自仕様を組み込もうとする動き（骨抜き化）が予想される1。  
これを防ぐためには、発注側（政府・企業）がアーキテクチャの主導権を握り、標準仕様への準拠を厳格に求める「アーキテクチャ・ガバナンス」が不可欠である。

### **6.2 法制度と「書面主義」の壁**

eシールや電子契約の法整備は進みつつあるが、現場レベルの運用規則や解釈基準では、依然として「紙」や「印影」を求める傾向が強い。例えば、税務調査において「JSONデータ」を提示しても、調査官がそれを読めなければ「印刷して持ってこい」と言われるのがオチである。  
Web/Aの社会実装には、データを人間が読める形式（HTMLやPDF）にレンダリングする「可視化機能（Visualizer）」の標準化もセットで進める必要がある。

### **6.3 トラストアンカーの確立**

Web/Aの信頼の根幹は、誰がそのVCを発行したかという「発行者（Issuer）」の信頼性にある。政府（デジタル庁）は、マイナンバーカードを個人のトラストアンカーとして確立しつつあるが24、法人のトラストアンカー（商業登記に基づく法人IDとeシール）の普及はまだ途上である。この「法人ID基盤」の整備が遅れれば、Web/Aは画餅に帰す。

## **7\. 結論：Web/Aは「特効薬」となり得るか**

分析の結果、Web/A（Web/A、SRN、Trusted Webの複合概念）は、日本が直面する「2025年の崖」、システム連携の隘路、そして頑固なアナログ慣習を打破するための\*\*極めて高い潜在能力（Potential）\*\*を有していると結論づけられる。

その理由は以下の3点に集約される：

1. **非同期性の許容：** JSON-LDによる疎結合連携は、システム更改時期のズレを吸収し、全体の硬直化（すくみ）を解消する唯一の技術的解である。  
2. **コスト構造の転換：** エージェントによる自律的な連携は、人海戦術による個別開発（人月モデル）を不要にし、IT投資を「維持」から「革新」へと振り向けることを可能にする。  
3. **デジタルトラストの確立：** VCとeシールによるデータ中心型の信頼モデルは、ハンコやFaxが担ってきた社会的機能をデジタル空間で完全に代替し、PPAPのような不合理な慣習を根絶する論理的基盤を提供する。

しかし、この潜在能力を顕在化させるためには、単なる技術導入ではなく、日本の組織文化そのもののOSを書き換える覚悟が必要である。「前例踏襲」や「全会一致」を旨とする日本型意思決定プロセスにおいては、Web/Aのような分散自律型のアーキテクチャは理解されにくい。  
楠正憲氏らが提唱するこのコンセプトは、技術論である以上に、日本社会に対する「信頼の在り方」を問う哲学的な問いかけでもある。この問いに対し、政府と民間が「分散と自律」を選び取れるかどうかが、デジタル敗戦からの復興の成否を握っている。

### ---

**補遺：関連する技術標準と用語解説**

Web/A (Web of Agents):  
人間ではなくソフトウェア・エージェントが主体となって活動するウェブの概念。エージェントはユーザーの代理として情報の探索、交渉、契約などを行う。  
SRN (Semantic Resource Network):  
リソース（データやサービス）が意味的（セマンティック）な情報を持ち、相互にリンクされたネットワーク。データの「形」だけでなく「意味」を共有することで、高度な自動処理を可能にする。  
JSON-LD (JSON for Linked Data):  
JSON形式のデータに、そのデータの意味定義（コンテキスト）を埋め込むためのW3C標準規格。Web/Aにおける共通言語として機能する。  
Verifiable Credentials (VC):  
W3Cで標準化されている、デジタル世界における「検証可能な資格情報」。物理的な免許証や社員証のデジタル版であり、発行元の署名により改ざん不能性が担保される。  
e-Seal (eシール):  
EUのeIDAS規則などで定義される、法人が発行する電子データに対する電子的な印章。個人の電子署名とは区別され、データの出所（組織）と完全性を証明する。脱ハンコ・脱PPAPの切り札とされる。

#### **引用文献**

1. 【マンガでわかる】2025年の崖とは？DX最新動向も含めて解説 \- NTTドコモビジネス, 12月 31, 2025にアクセス、 [https://www.ntt.com/business/services/xmanaged/lp/column/2025.html](https://www.ntt.com/business/services/xmanaged/lp/column/2025.html)  
2. 2025年の崖とは？経産省のDXレポートが示す問題と対策方法をわかりやすく解説, 12月 31, 2025にアクセス、 [https://aladdin-office.com/column/column13/](https://aladdin-office.com/column/column13/)  
3. Actions · masanork/tfrv \- GitHub, 12月 31, 2025にアクセス、 [https://github.com/masanork/tfrv/actions](https://github.com/masanork/tfrv/actions)  
4. (PDF) Enabling a knowledge supply chain: From content resources to ontologies, 12月 31, 2025にアクセス、 [https://www.researchgate.net/publication/228891580\_Enabling\_a\_knowledge\_supply\_chain\_From\_content\_resources\_to\_ontologies](https://www.researchgate.net/publication/228891580_Enabling_a_knowledge_supply_chain_From_content_resources_to_ontologies)  
5. Issues concerning Competition Policy for the Improvement of the Financial Service Utilizing Fintech（Summary）, 12月 31, 2025にアクセス、 [https://www.jftc.go.jp/en/pressreleases/yearly-2020/April/20042102.pdf](https://www.jftc.go.jp/en/pressreleases/yearly-2020/April/20042102.pdf)  
6. The JBA SDGs Report 2024-2025 \- 全国銀行協会, 12月 31, 2025にアクセス、 [https://www.zenginkyo.or.jp/fileadmin/res/en/outline/sdgs/SDGsreport\_2024-2025e.pdf](https://www.zenginkyo.or.jp/fileadmin/res/en/outline/sdgs/SDGsreport_2024-2025e.pdf)  
7. What is ISO 20022? How smaller institutions can become ISO 20022 compliant \- Eastnets, 12月 31, 2025にアクセス、 [https://www.eastnets.com/blog/blog/what-is-iso-20022-how-smaller-institutions-can-become-iso-20022-compliant](https://www.eastnets.com/blog/blog/what-is-iso-20022-how-smaller-institutions-can-become-iso-20022-compliant)  
8. Next generation Zengin System delayed to 2028 | by Norbert Gehrke | Tokyo FinTech, 12月 31, 2025にアクセス、 [https://medium.com/tokyo-fintech/next-generation-zengin-system-delayed-to-2028-f8011652b686](https://medium.com/tokyo-fintech/next-generation-zengin-system-delayed-to-2028-f8011652b686)  
9. PPAPとは？危険性と問題点・今後の代替案4つも紹介 | ＮＴＴデータ関西公式オウンドメディア, 12月 31, 2025にアクセス、 [https://www.nttdata-kansai.co.jp/media/012/](https://www.nttdata-kansai.co.jp/media/012/)  
10. PPAPの問題点を正しく理解！新制度への対応ポイントを徹底解説 \- ITトレンド, 12月 31, 2025にアクセス、 [https://it-trend.jp/encrypted-mail/article/237-746](https://it-trend.jp/encrypted-mail/article/237-746)  
11. Five reasons to stop using password-protected zip file email attachments: Why is it so dangerous? \- 使えるねっと, 12月 31, 2025にアクセス、 [https://www.tsukaeru.net/en/blog/alternatives-for-password-protected-zip-files/](https://www.tsukaeru.net/en/blog/alternatives-for-password-protected-zip-files/)  
12. The Agentic Web: A Network of Autonomous AI Agents on the Rise \- Cogent Infotech, 12月 31, 2025にアクセス、 [https://www.cogentinfo.com/resources/the-agentic-web-a-network-of-autonomous-ai-agents-on-the-rise](https://www.cogentinfo.com/resources/the-agentic-web-a-network-of-autonomous-ai-agents-on-the-rise)  
13. Concepts & Definitions \- Data standards | resources.data.gov, 12月 31, 2025にアクセス、 [https://resources.data.gov/standards/concepts/](https://resources.data.gov/standards/concepts/)  
14. Paul's notes on how JSON-LD works, 12月 31, 2025にアクセス、 [https://paulfrazee.medium.com/pauls-notes-on-how-json-ld-works-965732ea559d](https://paulfrazee.medium.com/pauls-notes-on-how-json-ld-works-965732ea559d)  
15. The "Verifiable Credential" Movement: Portable Reputation for Businesses, 12月 31, 2025にアクセス、 [https://www.jasminedirectory.com/blog/the-verifiable-credential-movement-portable-reputation-for-businesses/](https://www.jasminedirectory.com/blog/the-verifiable-credential-movement-portable-reputation-for-businesses/)  
16. Enterprise Guide to Decentralized Identity & Verifiable Credentials \- segura.security, 12月 31, 2025にアクセス、 [https://segura.security/post/enterprise-guide-to-decentralized-identity/](https://segura.security/post/enterprise-guide-to-decentralized-identity/)  
17. Internet 3.0: Architecture for a Web-of-Agents with it's Algorithm for Ranking Agents \- arXiv, 12月 31, 2025にアクセス、 [https://arxiv.org/html/2509.04979v1](https://arxiv.org/html/2509.04979v1)  
18. Federating Platforms with Linked Data \- Hello Future, 12月 31, 2025にアクセス、 [https://hellofuture.orange.com/en/federating-platforms-with-linked-data/](https://hellofuture.orange.com/en/federating-platforms-with-linked-data/)  
19. Unconstrained JSON-LD Performance Is Bad for API Specs | Dr. Chuck's Blog, 12月 31, 2025にアクセス、 [https://www.dr-chuck.com/csev-blog/2016/04/json-ld-performance-sucks-for-api-specs/](https://www.dr-chuck.com/csev-blog/2016/04/json-ld-performance-sucks-for-api-specs/)  
20. 楠 正憲 氏 \- Privacy by Design Conference 2025, 12月 31, 2025にアクセス、 [https://conference.privacybydesign.jp/2025/speaker\_2](https://conference.privacybydesign.jp/2025/speaker_2)  
21. Guidelines on e-Seal, 12月 31, 2025にアクセス、 [https://www.soumu.go.jp/main\_sosiki/joho\_tsusin/eng/pressrelease/2024/pdf/000380187\_20240416\_1\_2.pdf](https://www.soumu.go.jp/main_sosiki/joho_tsusin/eng/pressrelease/2024/pdf/000380187_20240416_1_2.pdf)  
22. Final Report of Study Group on e-Seal, 12月 31, 2025にアクセス、 [https://www.soumu.go.jp/main\_sosiki/joho\_tsusin/eng/pressrelease/2024/pdf/000380185\_20240416\_1\_1.pdf](https://www.soumu.go.jp/main_sosiki/joho_tsusin/eng/pressrelease/2024/pdf/000380185_20240416_1_1.pdf)  
23. Headline news on February 21, 2020 \- GIGAZINE, 12月 31, 2025にアクセス、 [https://gigazine.net/gsc\_news/en/20200221-headline/](https://gigazine.net/gsc_news/en/20200221-headline/)  
24. White Paper: Passkeys and Verifiable Digital Credentials: A Harmonized Path to Secure Digital Identity | FIDO Alliance, 12月 31, 2025にアクセス、 [https://fidoalliance.org/passkeys-and-verifiable-digital-credentials-a-harmonized-path-to-secure-digital-identity/](https://fidoalliance.org/passkeys-and-verifiable-digital-credentials-a-harmonized-path-to-secure-digital-identity/)