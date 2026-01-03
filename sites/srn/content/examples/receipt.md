---
title: "Verified Receipt (Receipt of Payment)"
layout: article
description: "A sample verified receipt (invoice) created using Web/A."
style: |
    .receipt-container {
        font-family: "Courier New", Courier, monospace;
        border: 1px dashed #ccc;
        padding: 2rem;
        background: #fff;
        max-width: 400px;
        margin: 0 auto;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .receipt-header {
        text-align: center;
        border-bottom: 1px dashed #000;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }
    .store-name { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
    .receipt-meta { font-size: 0.8rem; color: #555; }
    .receipt-total {
        font-size: 1.5rem;
        font-weight: bold;
        text-align: right;
        margin: 1rem 0;
        padding-top: 0.5rem;
        border-top: 1px dotted #000;
    }
    .receipt-details { width: 100%; font-size: 0.9rem; }
    .receipt-details td { padding: 0.2rem 0; }
    .receipt-details td.price { text-align: right; }
    .issuer-info {
        margin-top: 2rem;
        font-size: 0.8rem;
        text-align: center;
        color: #777;
    }
---

<div class="receipt-container">
    <div class="receipt-header">
        <div class="store-name">ACME Coffee Roasters</div>
        <div class="receipt-meta">
            Date: 2026-01-03 14:30:00<br>
            Receipt #: <span id="receipt-id">R-20260103-0012</span><br>
            Terminal: POS-01
        </div>
    </div>

    <table class="receipt-details">
        <tr>
            <td>Drip Coffee (Hot)</td>
            <td class="price">¥450</td>
        </tr>
        <tr>
            <td>Espresso Double</td>
            <td class="price">¥380</td>
        </tr>
        <tr>
            <td>Coffee Beans (200g)</td>
            <td class="price">¥1,200</td>
        </tr>
    </table>

    <div class="receipt-total">
        Total: ¥2,030 <span style="font-size:0.8rem; font-weight:normal;">(Tax Inc.)</span>
    </div>

    <div class="issuer-info">
        <p>Thank you for visiting!</p>
        <p>Issuer ID: T1234567890123<br>(Qualified Invoice Issuer)</p>
    </div>
</div>

<div style="text-align:center; margin-top:2rem; color:#666;">
    <small>
        This is a <strong>Web/A Verified Receipt</strong>.<br>
        The HTML content above is cryptographically signed.<br>
        Data (JSON-LD) is embedded for automated processing.
    </small>
</div>

<script type="application/json" id="wa-input-data">
{
    "@context": "https://schema.org",
    "@type": "Invoice",
    "description": "Receipt of Payment",
    "invoiceDate": "2026-01-03T14:30:00+09:00",
    "identifier": "R-20260103-0012",
    "provider": {
        "@type": "Organization",
        "name": "ACME Coffee Roasters",
        "taxID": "T1234567890123"
    },
    "totalPaymentDue": {
        "@type": "PriceSpecification",
        "price": 2030,
        "priceCurrency": "JPY"
    },
    "referencesOrder": [
        { "@type": "OrderItem", "orderItemStatus": "Delivered", "orderItemNumber": "1", "name": "Drip Coffee (Hot)", "price": 450, "priceCurrency": "JPY" },
        { "@type": "OrderItem", "orderItemStatus": "Delivered", "orderItemNumber": "2", "name": "Espresso Double", "price": 380, "priceCurrency": "JPY" },
        { "@type": "OrderItem", "orderItemStatus": "Delivered", "orderItemNumber": "3", "name": "Coffee Beans (200g)", "price": 1200, "priceCurrency": "JPY" }
    ]
}
</script>
