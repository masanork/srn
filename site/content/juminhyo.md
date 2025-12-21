---
title: "住民票の写しサンプル"
layout: official
date: 2024-12-21
description: "住民票の写しのサンプル（Verifiable Credential）"
font: ipamjm.ttf,acgjm.ttf
---

<style>
  .jumin-container {
    font-family: 'IPAmjMincho', serif;
    max-width: 100%;
    margin: 0 auto;
    border: 4px double #333;
    padding: 30px;
    background-color: #fff;
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
  }
  .jumin-header {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 40px;
    letter-spacing: 5px;
    text-decoration: underline;
    text-underline-offset: 8px;
  }
  .jumin-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
    font-size: 16px;
  }
  .jumin-table th, .jumin-table td {
    border: 1px solid #333;
    padding: 12px;
  }
  .jumin-table th {
    background-color: #f5f5f5;
    width: 18%;
    text-align: left;
    white-space: nowrap;
  }
  .member-block {
    border: 2px solid #333;
    margin-bottom: 20px;
    break-inside: avoid;
  }
  .member-table {
    width: 100%;
    border-collapse: collapse;
  }
  .member-table th {
    background-color: #fafafa;
    font-weight: normal;
    font-size: 13px;
    border-bottom: 1px dotted #ccc;
    border-right: 1px dotted #ccc;
    text-align: left;
    padding: 6px 10px;
    width: 15%;
    color: #555;
  }
  .member-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }
  .member-num {
    background: #eef; 
    vertical-align: middle; 
    text-align: center; 
    width: 40px; 
    font-weight: bold;
    border-right: 2px solid #333;
  }
  .col-name { 
    font-size: 1.4em; 
    font-weight: bold; 
    font-family: 'IPAmjMincho', serif;
  }
  .col-kana {
    font-size: 0.8em;
    color: #555;
    margin-bottom: -5px;
    display: block;
  }
  .footer-cert {
    margin-top: 60px;
    text-align: right;
    line-height: 2;
    position: relative;
  }
  .hanko {
    position: absolute;
    right: 0px;
    top: 30px;
    width: 80px;
    height: 80px;
    border: 3px solid #d00;
    border-radius: 50%;
    color: #d00;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transform: rotate(-10deg);
    opacity: 0.7;
    pointer-events: none;
    font-weight: bold;
  }
</style>

<div class="jumin-container">
  <div class="jumin-header">住民票の写し</div>

  <table class="jumin-table">
    <tr>
      <th>現住所</th>
      <td>東京都千代田区千代田１番１号</td>
    </tr>
    <tr>
      <th>世帯主氏名</th>
      <td>徳川　家康</td>
    </tr>
  </table>

  <!-- 構成員 1 -->
  <div class="member-block">
    <table class="member-table">
      <tr>
        <td rowspan="5" class="member-num">1</td>
        <th>氏名</th>
        <td colspan="3">
          <span class="col-kana">トクガワ　イエヤス</span>
          <span class="col-name">徳川　家康</span>
        </td>
      </tr>
      <tr>
        <th>生年月日</th>
        <td>天文11年12月26日</td>
        <th>性別</th>
        <td>男</td>
      </tr>
      <tr>
        <th>続柄</th>
        <td>世帯主</td>
        <th>住民となった日</th>
        <td>慶長8年2月12日</td>
      </tr>
      <tr>
        <th>本籍</th>
        <td colspan="3">
          三河国岡崎（愛知県岡崎市康生町561番地）<br>
          筆頭者：徳川　広忠
        </td>
      </tr>
      <tr>
        <th>備考</th>
        <td colspan="3">
          住民票コード：12345678901
        </td>
      </tr>
    </table>
  </div>

  <!-- 構成員 2 -->
  <div class="member-block">
    <table class="member-table">
      <tr>
        <td rowspan="5" class="member-num">2</td>
        <th>氏名</th>
        <td colspan="3">
          <span class="col-kana">トクガワ　ヒデタダ</span>
          <span class="col-name">徳川　秀忠</span>
        </td>
      </tr>
      <tr>
        <th>生年月日</th>
        <td>天正7年4月7日</td>
        <th>性別</th>
        <td>男</td>
      </tr>
      <tr>
        <th>続柄</th>
        <td>子</td>
        <th>住民となった日</th>
        <td>慶長10年4月16日</td>
      </tr>
      <tr>
        <th>前住所</th>
        <td colspan="3">
          遠江国浜松
        </td>
      </tr>
      <tr>
        <th>備考</th>
        <td colspan="3">
           [font:ipamjm.ttf:MJ000216]田家より転入 <!-- 土の下が長い吉 (MJ000216) -->
        </td>
      </tr>
    </table>
  </div>
  
  <!-- 構成員 3 (外字デモ) -->
  <div class="member-block">
    <table class="member-table">
      <tr>
        <td rowspan="4" class="member-num">3</td>
        <th>氏名</th>
        <td colspan="3">
          <span class="col-kana">サイトウ　ハジメ</span>
          <span class="col-name">[font:ipamjm.ttf:MJ059659]藤　一</span> <!-- 斉の異体字 -->
        </td>
      </tr>
      <tr>
        <th>生年月日</th>
        <td>弘化元年1月1日</td>
        <th>性別</th>
        <td>男</td>
      </tr>
      <tr>
        <th>続柄</th>
        <td>縁故者</td>
        <th>住民となった日</th>
        <td>明治元年1月1日</td>
      </tr>
      <tr>
        <th>備考</th>
        <td colspan="3">
           転入届出：明治元年1月5日
        </td>
      </tr>
    </table>
  </div>


  <div class="footer-cert">
    <p>これは、住民基本台帳に記録されている事項の写しであることを証明する。</p>
    <p>令和7年12月21日</p>
    <p style="font-size:1.4em; font-weight:bold; margin-top:20px;">
      東京都千代田区長　千代田　太[font:ipamjm.ttf:MJ005232]
    </p> <!-- 郎の異体字 -->
    <div class="hanko">
      公印<br>省略
    </div>
  </div>

</div>
