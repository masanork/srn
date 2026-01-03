---
title: "Transaction Statement (入出金明細書)"
layout: article
description: "A standard bank transaction statement created using Web/A."
style: |
    .statement-container {
        font-family: "Hiragino Mincho ProN", "Yu Mincho", serif;
        max-width: 800px;
        margin: 2rem auto;
        padding: 4rem;
        background: #fff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05); /* Subtle shadow just for demo visibility */
        color: #000;
    }
    .header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid #000;
        padding-bottom: 0.5rem;
        margin-bottom: 2rem;
    }
    .bank-logo {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .statement-title {
        font-size: 1.5rem;
        font-weight: bold;
        letter-spacing: 0.2em;
    }
    .account-info {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem 2rem;
        margin-bottom: 2rem;
        font-size: 0.9rem;
    }
    .account-info dt { font-weight: bold; }
    .account-info dd { margin: 0; }

    table.tx-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
    }
    table.tx-table th {
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
        padding: 0.5rem;
        text-align: center;
        background: #f9f9f9;
        font-weight: normal;
    }
    table.tx-table td {
        border-bottom: 1px dotted #ccc;
        padding: 0.5rem;
    }
    table.tx-table td.date { text-align: center; }
    table.tx-table td.amount { text-align: right; font-family: "Courier New", monospace; }
    table.tx-table td.balance { text-align: right; font-family: "Courier New", monospace; font-weight: bold; }
    
    .footer-note {
        margin-top: 3rem;
        font-size: 0.8rem;
        border-top: 1px solid #000;
        padding-top: 0.5rem;
    }
---

<div class="statement-container">
    <div class="header-row">
        <div class="statement-title">取引推移明細書</div>
        <div class="bank-logo">空音銀行 (Sorane Bank)</div>
    </div>

    <div class="account-info">
        <dt>店番・口座番号</dt>
        <dd>123 - 1234567</dd>
        <dt>おなまえ</dt>
        <dd>ソラネ　タロウ　様</dd>
        <dt>対象期間</dt>
        <dd>2025年12月1日 〜 2025年12月31日</dd>
    </div>

    <table class="tx-table">
        <thead>
            <tr>
                <th style="width: 15%">年月日</th>
                <th style="width: 40%">お取引内容</th>
                <th style="width: 15%">お支払金額</th>
                <th style="width: 15%">お預り金額</th>
                <th style="width: 15%">差引残高</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="date">2025-12-01</td>
                <td>前月からの繰越</td>
                <td class="amount"></td>
                <td class="amount"></td>
                <td class="balance">245,000</td>
            </tr>
            <tr>
                <td class="date">2025-12-10</td>
                <td>ミツビシＵＦＪニコス</td>
                <td class="amount">15,400</td>
                <td class="amount"></td>
                <td class="balance">229,600</td>
            </tr>
            <tr>
                <td class="date">2025-12-15</td>
                <td>振込　サラリー</td>
                <td class="amount"></td>
                <td class="amount">320,000</td>
                <td class="balance">549,600</td>
            </tr>
            <tr>
                <td class="date">2025-12-25</td>
                <td>電気料金</td>
                <td class="amount">8,500</td>
                <td class="amount"></td>
                <td class="balance">541,100</td>
            </tr>
            <tr>
                <td class="date">2025-12-27</td>
                <td>ヤチン</td>
                <td class="amount">90,000</td>
                <td class="amount"></td>
                <td class="balance">451,100</td>
            </tr>
        </tbody>
    </table>

    <div class="footer-note">
        <p>※ 本書は、Web/Aプロトコルにより電子署名された正式な取引明細書です。ブラウザの検証機能により真正性を確認できます。<br>
        ※ This document is cryptographically signed. The content displayed is the verified data.</p>
    </div>
</div>

<script type="application/json" id="wa-input-data">
{
    "@context": "https://schema.org",
    "@type": "BankAccount",
    "bankAccountType": "Checking",
    "accountNumber": "123-1234537",
    "name": "Taro Sorane",
    "bank": "Sorane Bank",
    "interactionStatistic": [
        { "@type": "MonetaryAmount", "date": "2025-12-01", "name": "Forward Balance", "amount": 245000, "currency": "JPY" },
        { "@type": "MonetaryAmount", "date": "2025-12-10", "name": "Credit Card Payment", "amount": -15400, "currency": "JPY" },
        { "@type": "MonetaryAmount", "date": "2025-12-15", "name": "Salary Deposit", "amount": 320000, "currency": "JPY" },
        { "@type": "MonetaryAmount", "date": "2025-12-25", "name": "Electricity Bill", "amount": -8500, "currency": "JPY" },
        { "@type": "MonetaryAmount", "date": "2025-12-27", "name": "Rent Payment", "amount": -90000, "currency": "JPY" }
    ]
}
</script>
