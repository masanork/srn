---
title: "戸籍全部事項証明書（見本）"
layout: official
font: 
  - ipamjm.ttf,acgjm.ttf
recipient: "法務 太郎"
---

<div class="koseki-document">

<div class="koseki-header">
  <h1>全　部　事　項　証　明　書</h1>
</div>

<div class="koseki-section main-info">
  <div class="row">
    <div class="label">【本　籍】</div>
    <div class="value">東京都千代田区千代田１番</div>
  </div>
  <div class="row">
    <div class="label">【筆頭者】</div>
    <div class="value">法務　太郎</div>
  </div>
</div>

<div class="koseki-section">
  <div class="section-title">【戸籍事項】</div>
  <div class="row">
    <div class="label">【改製日】</div>
    <div class="value">平成６年法務省令第５１号附則第２条第１項の規定により改製</div>
  </div>
  <div class="row">
    <div class="label">【改製事由】</div>
    <div class="value">平成１０年１０月１０日改製</div>
  </div>
</div>

<hr class="koseki-divider">

<!-- 筆頭者 -->
<div class="koseki-person">
  <div class="row person-header">
    <div class="label">【名】</div>
    <div class="value">太郎</div>
  </div>
  <div class="row">
    <div class="label">【生年月日】</div>
    <div class="value">昭和３４年６月１日</div>
  </div>
  <div class="row">
    <div class="label">【父】</div>
    <div class="value">法務　一郎</div>
  </div>
  <div class="row">
    <div class="label">【母】</div>
    <div class="value">法務　花子</div>
  </div>
  <div class="row">
    <div class="label">【続柄】</div>
    <div class="value">長男</div>
  </div>
  
  <div class="status-block">
    <div class="status-title">【身分事項】</div>
    <div class="status-row">
        <div class="status-label">【出生】</div>
        <div class="status-value">
            昭和３４年６月１日東京都千代田区で出生<br>
            昭和３４年６月１４日父　法務一郎届出<br>
            送付を受けた日　昭和３４年６月２０日<br>
            受理者　東京都千代田区長
        </div>
    </div>
    <div class="status-row">
        <div class="status-label">【婚姻】</div>
        <div class="status-value">
            昭和６０年１１月２２日妻　花子と婚姻<br>
            昭和６０年１１月２２日　東京都千代田区長受付け<br>
            送付を受けた日　昭和６０年１１月３０日<br>
            受理者　東京都千代田区長
        </div>
    </div>
  </div>
</div>

<hr class="koseki-divider">

<!-- 配偶者 -->
<div class="koseki-person">
  <div class="row person-header">
    <div class="label">【名】</div>
    <div class="value">花子</div>
  </div>
  <div class="row">
    <div class="label">【生年月日】</div>
    <div class="value">昭和３７年３月３日</div>
  </div>
  <div class="row">
    <div class="label">【父】</div>
    <div class="value">司法　次郎</div>
  </div>
  <div class="row">
    <div class="label">【母】</div>
    <div class="value">司法　梅子</div>
  </div>
  <div class="row">
    <div class="label">【続柄】</div>
    <div class="value">長女</div>
  </div>
  <div class="row">
    <div class="label">【配偶者区分】</div>
    <div class="value">妻</div>
  </div>

  <div class="status-block">
    <div class="status-title">【身分事項】</div>
    <div class="status-row">
        <div class="status-label">【出生】</div>
        <div class="status-value">
            昭和３７年３月３日大阪府大阪市北区で出生<br>
            昭和３７年３月１０日父　司法次郎届出
        </div>
    </div>
    <div class="status-row">
        <div class="status-label">【婚姻】</div>
        <div class="status-value">
            昭和６０年１１月２２日夫　太郎と婚姻<br>
            同日東京都千代田区長受付け<br>
            入籍日　昭和６０年１１月３０日
        </div>
    </div>
  </div>
</div>

<hr class="koseki-divider">

<div class="koseki-footer">
    <div class="cert-text">
        これは、戸籍に記録されている事項の全部を証明した書面である。
    </div>
    
    <div class="issue-date">
        令和７年１２月２１日
    </div>
    
    <div class="issuer">
        <div class="issuer-title">東京都千代田区長</div>
        <div class="issuer-name">千代田　区太郎</div>
        <div class="issuer-seal">公印</div>
    </div>
</div>

</div>

<style>
    .koseki-document {
        font-family: "ipamjm", "serif";
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background: #fff;
        border: 1px solid #ddd;
        writing-mode: horizontal-tb; /* 戸籍謄本は今は横書きが一般的 */
    }

    .koseki-header h1 {
        text-align: center;
        font-size: 1.8rem;
        margin-bottom: 2rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #000;
        letter-spacing: 0.5rem;
    }

    .koseki-section {
        margin-bottom: 1.5rem;
    }

    .row {
        display: flex;
        margin-bottom: 0.5rem;
        align-items: baseline;
    }

    .label {
        width: 120px;
        font-weight: bold;
        flex-shrink: 0;
    }

    .value {
        flex-grow: 1;
    }

    .section-title {
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .koseki-divider {
        border: 0;
        border-top: 1px dashed #999;
        margin: 2rem 0;
    }

    .koseki-person {
        margin-bottom: 2rem;
    }

    .person-header {
        font-size: 1.1rem;
        font-weight: bold;
    }

    .status-block {
        margin-top: 1rem;
        margin-left: 1rem;
        padding-left: 1rem;
        border-left: 2px solid #eee;
    }
    
    .status-title {
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .status-row {
        display: flex;
        margin-bottom: 1rem;
    }

    .status-label {
        width: 100px;
        font-weight: bold;
        flex-shrink: 0;
        color: #444;
    }

    .status-value {
        line-height: 1.6;
    }

    .koseki-footer {
        margin-top: 4rem;
        text-align: right;
    }

    .cert-text {
        text-align: left;
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }

    .issue-date {
        margin-bottom: 2rem;
    }

    .issuer {
        display: inline-block;
        text-align: left;
        position: relative;
    }
    
    .issuer-title {
        font-size: 1.2rem;
    }
    .issuer-name {
        font-size: 1.5rem;
        margin-top: 0.5rem;
    }
    
    .issuer-seal {
        position: absolute;
        right: -2rem;
        top: 0.5rem;
        width: 3rem;
        height: 3rem;
        border: 2px solid #d00;
        color: #d00;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transform: rotate(-15deg);
        opacity: 0.8;
    }
</style>
