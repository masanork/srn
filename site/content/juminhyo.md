```
---
title: "（見本）住民票"
layout: official
date: 2024-12-21
description: "総務省標準仕様準拠 住民票の写し（見本）"
font: ipamjm.ttf,acgjm.ttf
---

<style>
  .jumin-sheet {
    font-family: 'IPAmjMincho', serif;
    max-width: 100%;
    margin: 0 auto;
    border: 1px solid #000;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    position: relative;
  }
  .watermark {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 80px;
    color: rgba(200, 200, 200, 0.5);
    z-index: 0;
    pointer-events: none;
    font-weight: bold;
    border: 5px solid rgba(200, 200, 200, 0.5);
    padding: 20px 50px;
  }
  .header-area {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
  }
  .title {
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 5px;
  }
  .issue-date {
    font-size: 14px;
  }
  .main-info {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 5px;
  }
  .main-info th, .main-info td {
    border: 1px solid #000;
    padding: 5px 8px;
    vertical-align: top;
  }
  .main-info th {
    background-color: #f0f0f0;
    width: 15%;
    text-align: left;
    font-weight: normal;
    font-size: 12px;
  }
  .person-block {
    border: 2px solid #000;
    margin-top: -1px; /* Overlap borders */
    margin-bottom: 20px;
    break-inside: avoid;
  }
  .person-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .person-table th, .person-table td {
    border: 1px solid #000;
    padding: 5px 8px;
    vertical-align: middle;
  }
  .person-table th {
    background-color: #f9f9f9;
    font-weight: normal;
    font-size: 12px;
    width: 12%;
    text-align: left;
  }
  .kana {
    font-size: 10px;
    color: #555;
    display: block;
    margin-bottom: 2px;
  }
  .name-large {
    font-size: 18px;
    font-weight: bold;
  }
  .col-num {
    width: 30px;
    text-align: center;
    background-color: #e0e0e0;
    font-weight: bold;
    border-right: 2px solid #000;
  }
  .footer-area {
    margin-top: 40px;
    text-align: center;
    page-break-inside: avoid;
  }
  .cert-text {
    text-align: left;
    margin-bottom: 20px;
    line-height: 1.8;
  }
  .official-seal-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 30px;
  }
  .mayor-name {
    font-size: 16px;
    margin-right: 20px;
  }
  .stamp-box {
    width: 60px;
    height: 60px;
    border: 3px solid #d00;
    color: #d00;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    border-radius: 50%;
  }
</style>

<div class="jumin-sheet">
  <div class="watermark">見　本</div>
  
  <div class="header-area">
    <div class="title">住民票</div>
    <div class="issue-date">発行日：令和8年1月15日</div>
  </div>

  <table class="main-info">
    <tr>
      <th style="width: 100px;">住所</th>
      <td colspan="3">東京都千代田区千代田１番１号</td>
    </tr>
    <tr>
      <th>世帯主氏名</th>
      <td colspan="3">山田　𠮷男</td>
    </tr>
  </table>

  <!-- Person 1 -->
  <div class="person-block">
    <table class="person-table">
      <tr>
        <td rowspan="4" class="col-num">1</td>
        <th>氏名</th>
        <td colspan="3">
          <span class="kana">ヤマダ　ヨシオ</span>
          <span class="name-large">山田　𠮷男</span> <!-- 𠮷: U+20BB7 -->
        </td>
      </tr>
      <tr>
        <th>生年月日</th>
        <td style="width: 30%;">昭和55年12月26日</td>
        <th>性別</th>
        <td>男</td>
      </tr>
      <tr>
        <th>続柄</th>
        <td>世帯主</td>
        <th>住民となった日</th>
        <td>平成20年4月1日</td>
      </tr>
      <tr>
        <th>本籍</th>
        <td colspan="3">
          東京都千代田区千代田１番地<br>
          筆頭者：山田　太郎
        </td>
      </tr>
      <tr>
        <td style="border:none;"></td> <!-- spacer for num column -->
        <th>備考</th>
        <td colspan="3">
          マイナンバー：************
        </td>
      </tr>
    </table>
  </div>

  <!-- Person 2 -->
  <div class="person-block">
    <table class="person-table">
      <tr>
        <td rowspan="4" class="col-num">2</td>
        <th>氏名</th>
        <td colspan="3">
          <span class="kana">サイトウ　ハジメ</span>
          <span class="name-large">斉󠄃藤　一</span> <!-- 斉󠄃: U+6589 U+E0103 -->
        </td>
      </tr>
      <tr>
        <th>生年月日</th>
        <td>平成1年1月1日</td>
        <th>性別</th>
        <td>男</td>
      </tr>
      <tr>
        <th>続柄</th>
        <td>世帯主の子</td>
        <th>住民となった日</th>
        <td>令和5年6月1日</td>
      </tr>
      <tr>
        <th>前住所</th>
        <td colspan="3">
          埼玉県さいたま市浦和区
        </td>
      </tr>
      <tr>
        <td style="border:none;"></td>
        <th>備考</th>
        <td colspan="3">
         田家より転入
        </td>
      </tr>
    </table>
  </div>

  <div class="footer-area">
    <div class="cert-text">
      この写しは、住民基本台帳の原本と相違ないことを証明する。
    </div>
    
    <div class="official-seal-row">
      <div class="mayor-name">
        千代田区長　千代田　太䥲 <!-- 䥲: U+4972 -->
      </div>
      <div class="stamp-box">
        公印<br>省略
      </div>
    </div>
  </div>

</div>
```
