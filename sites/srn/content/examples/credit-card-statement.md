---
title: "Credit Card Statement (利用明細書)"
layout: article
description: "A standard credit card statement created using Web/A."
style: |
    .cc-container {
        font-family: sans-serif;
        max-width: 800px;
        margin: 2rem auto;
        padding: 3rem;
        background: #fff;
        border: 1px solid #ddd;
        color: #333;
    }
    .cc-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2rem;
        border-bottom: 4px solid #0056b3;
        padding-bottom: 1rem;
    }
    .card-brand {
        font-size: 1.5rem;
        font-weight: bold;
        color: #0056b3;
        font-style: italic;
    }
    .statement-period {
        text-align: right;
        font-size: 0.9rem;
    }
    .summary-box {
        display: flex;
        gap: 2rem;
        background: #f0f7ff;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
    }
    .summary-item {
        flex: 1;
    }
    .summary-label {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.25rem;
    }
    .summary-value {
        font-size: 1.25rem;
        font-weight: bold;
    }
    .summary-value.total {
        color: #d00;
        font-size: 1.5rem;
    }
    
    table.detail-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
    }
    table.detail-table th {
        background: #0056b3;
        color: #fff;
        padding: 0.5rem;
        text-align: left;
    }
    table.detail-table td {
        border-bottom: 1px solid #eee;
        padding: 0.6rem 0.5rem;
    }
    .col-date { width: 12%; }
    .col-desc { width: 40%; }
    .col-method { width: 15%; text-align: center; }
    .col-amount { width: 15%; text-align: right; }
    .col-notes { width: 18%; color: #888; font-size: 0.8rem; }

    .points-section {
        margin-top: 2rem;
        border: 1px solid #ccc;
        padding: 1rem;
    }
    .points-header { font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px dotted #ccc; }
---

<div class="cc-container">
    <div class="cc-header">
        <div class="card-brand">Sorane Card</div>
        <div class="statement-period">
            <strong>ご利用明細書</strong><br>
            2026年1月10日 お支払分<br>
            (利用期間: 2025/11/16 - 2025/12/15)
        </div>
    </div>

    <div class="summary-box">
        <div class="summary-item">
            <div class="summary-label">今回お支払額</div>
            <div class="summary-value total">¥86,400</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">お支払日</div>
            <div class="summary-value">2026年1月10日</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">獲得ポイント</div>
            <div class="summary-value">432 pt</div>
        </div>
    </div>

    <table class="detail-table">
        <thead>
            <tr>
                <th class="col-date">利用日</th>
                <th class="col-desc">ご利用店名・商品名</th>
                <th class="col-method">支払区分</th>
                <th class="col-amount">金額</th>
                <th class="col-notes">摘要</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>11/20</td>
                <td>AMAZON.CO.JP</td>
                <td style="text-align:center">1回</td>
                <td style="text-align:right">4,500</td>
                <td></td>
            </tr>
            <tr>
                <td>11/25</td>
                <td>STARBUCKS COFFEE</td>
                <td style="text-align:center">1回</td>
                <td style="text-align:right">980</td>
                <td></td>
            </tr>
            <tr>
                <td>12/01</td>
                <td>東京電力エナジーパートナー</td>
                <td style="text-align:center">1回</td>
                <td style="text-align:right">12,400</td>
                <td>公共料金</td>
            </tr>
            <tr>
                <td>12/10</td>
                <td>JR東日本モバイルSuica</td>
                <td style="text-align:center">1回</td>
                <td style="text-align:right">10,000</td>
                <td></td>
            </tr>
            <tr>
                <td>12/12</td>
                <td>ユニクロ オンラインストア</td>
                <td style="text-align:center">1回</td>
                <td style="text-align:right">15,900</td>
                <td></td>
            </tr>
             <tr>
                <td>12/14</td>
                <td>スーパーマーケットライフ</td>
                <td style="text-align:center">1回</td>
                <td style="text-align:right">5,420</td>
                <td></td>
            </tr>
             <tr>
                <td>12/15</td>
                <td>ABCマート</td>
                <td style="text-align:center">2回(1/2)</td>
                <td style="text-align:right">12,000</td>
                <td>靴</td>
            </tr>
        </tbody>
    </table>

    <div class="points-section">
        <div class="points-header">ポイント情報</div>
        <div style="display:flex; justify-content:space-between;">
            <span>前月残高: 1,200 pt</span>
            <span>今回獲得: +432 pt</span>
            <span>今回利用: -0 pt</span>
            <strong>現在残高: 1,632 pt</strong>
        </div>
    </div>
    
    <div style="margin-top:2rem; font-size:0.8rem; color:#666; text-align:center;">
        ※ 本明細書はWeb/A Verified Documentです。<br>発行元: Sorane Card Co., Ltd.
    </div>
</div>

<script type="application/json" id="wa-input-data">
{
    "@context": "https://schema.org",
    "@type": "Invoice",
    "description": "Credit Card Statement",
    "paymentDueDate": "2026-01-10",
    "totalPaymentDue": { "@type": "PriceSpecification", "price": 86400, "priceCurrency": "JPY" },
    "referencesOrder": [
        { "@type": "OrderItem", "orderDate": "2025-11-20", "seller": { "name": "AMAZON.CO.JP" }, "price": 4500, "priceCurrency": "JPY" },
        { "@type": "OrderItem", "orderDate": "2025-11-25", "seller": { "name": "STARBUCKS" }, "price": 980, "priceCurrency": "JPY" },
        { "@type": "OrderItem", "orderDate": "2025-12-01", "seller": { "name": "TEPCO" }, "price": 12400, "priceCurrency": "JPY" },
         { "@type": "OrderItem", "orderDate": "2025-12-10", "seller": { "name": "Mobile Suica" }, "price": 10000, "priceCurrency": "JPY" },
         { "@type": "OrderItem", "orderDate": "2025-12-12", "seller": { "name": "UNIQLO" }, "price": 15900, "priceCurrency": "JPY" },
         { "@type": "OrderItem", "orderDate": "2025-12-14", "seller": { "name": "LIFE" }, "price": 5420, "priceCurrency": "JPY" },
         { "@type": "OrderItem", "orderDate": "2025-12-15", "seller": { "name": "ABC MART" }, "price": 12000, "priceCurrency": "JPY" }
    ]
}
</script>
