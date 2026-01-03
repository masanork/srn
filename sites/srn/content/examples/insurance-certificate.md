---
title: "Insurance Deduction Certificate (生命保険料控除証明書)"
layout: article
description: "A standard life insurance deduction certificate (hagaki style)."
style: |
    .hagaki-container {
        font-family: "Hiragino Mincho ProN", serif;
        width: 600px;
        margin: 2rem auto;
        border: 2px solid #333;
        padding: 5px;
        background: #fff;
        position: relative;
    }
    .hagaki-inner {
        border: 1px solid #000;
        padding: 10px;
    }
    .cert-title {
        text-align: center;
        font-size: 1.2rem;
        font-weight: bold;
        border-bottom: 2px double #000;
        margin-bottom: 10px;
        padding-bottom: 5px;
    }
    .section-header {
        background: #eee;
        font-weight: bold;
        padding: 2px 5px;
        font-size: 0.9rem;
        border: 1px solid #000;
        margin-top: 10px;
    }
    .info-grid {
        display: grid;
        grid-template-columns: 100px 1fr;
        font-size: 0.9rem;
        border: 1px solid #000;
        border-top: none;
    }
    .info-grid > div {
        padding: 4px;
        border-bottom: 1px solid #ccc;
    }
    .info-label { background: #f9f9f9; border-right: 1px solid #ccc; }
    
    table.deduction-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        margin-top: 5px;
    }
    table.deduction-table th, table.deduction-table td {
        border: 1px solid #000;
        padding: 4px;
        text-align: center;
    }
    table.deduction-table th { background: #eee; }
    
    .amount-box {
        font-family: "Courier New", monospace;
        font-weight: bold;
        text-align: right;
        padding-right: 8px !important;
    }
    
    .issuer-seal {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border: 2px solid #d00;
        border-radius: 50%;
        color: #d00;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.7rem;
        transform: rotate(-15deg);
        opacity: 0.8;
    }
    .bottom-note {
        font-size: 0.75rem;
        margin-top: 10px;
        line-height: 1.3;
    }
---

<div class="hagaki-container">
    <div class="hagaki-inner">
        <div class="cert-title">令和7年分 生命保険料控除証明書</div>
        <div class="issuer-seal">空音生命<br>之印</div>
        
        <div class="info-grid" style="border-top:1px solid #000;">
            <div class="info-label">ご契約者名</div>
            <div>ソラネ　タロウ　様</div>
            <div class="info-label">証券記号番号</div>
            <div>0123-4567-8901</div>
        </div>

        <div class="section-header">適用制度：新制度（一般生命保険料）</div>
        <table class="deduction-table">
            <tr>
                <th width="30%">保険種類</th>
                <th>保険期間</th>
                <th>契約年月日</th>
                <th>保険受取人</th>
            </tr>
            <tr>
                <td>終身保険</td>
                <td>終身</td>
                <td>R02.04.01</td>
                <td>配偶者</td>
            </tr>
        </table>
        
        <table class="deduction-table" style="margin-top:-1px;">
            <tr>
                <th width="50%">証明額（支払済額）<br><span style="font-weight:normal; font-size:0.8em">(本年12月末時点の予定額を含む)</span></th>
                <th width="50%" style="background:#ffffe0;">申告額<br><span style="font-weight:normal; font-size:0.8em">(年末調整・確定申告にご記入ください)</span></th>
            </tr>
            <tr style="height: 50px;">
                <td class="amount-box" style="font-size:1.2rem;">120,000 円</td>
                <td class="amount-box" style="font-size:1.2rem; background:#ffffe0;">120,000 円</td>
            </tr>
        </table>

        <div class="section-header" style="margin-top:15px;">適用制度：介護医療保険料</div>
         <table class="deduction-table">
            <tr>
                <th width="50%">証明額（支払済額）</th>
                <th width="50%" style="background:#ffffe0;">申告額</th>
            </tr>
            <tr style="height: 40px;">
                <td class="amount-box">******** 円</td>
                <td class="amount-box" style="background:#ffffe0;">******** 円</td>
            </tr>
        </table>

        <div class="bottom-note">
            <p>
            発行元：空音生命保険株式会社 (Sorane Life Insurance Co., Ltd.)<br>
            〒100-0001 東京都千代田区千代田1-1<br>
            ※この証明書はWeb/A Verified Documentです。電子データとして直接申告ソフトに取り込むことが可能です。
            </p>
        </div>
    </div>
</div>

<script type="application/json" id="wa-input-data">
{
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": "Life Insurance Deduction Certificate",
    "dateIssued": "2025-10-15",
    "recipient": { "name": "Taro Sorane" },
    "insurancePolicies": [
        {
            "category": "General",
            "policyNumber": "0123-4567-8901",
            "type": "Whole Life",
            "declaredAmount": 120000,
            "currency": "JPY"
        }
    ]
}
</script>
