---
title: "Certificate of Employment (就労証明書)"
layout: article
description: "A standard Certificate of Employment verified by Web/A."
style: |
    .cert-container {
        font-family: "Hiragino Mincho ProN", serif;
        max-width: A4;
        margin: 2rem auto;
        padding: 3rem;
        background: #fff;
        border: 1px solid #ddd;
        position: relative;
    }
    .cert-title {
        text-align: center;
        font-size: 1.8rem;
        font-weight: bold;
        margin-bottom: 3rem;
        letter-spacing: 0.5em;
        text-decoration: underline;
    }
    .cert-date {
        text-align: right;
        margin-bottom: 2rem;
    }
    .recipient {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        border-bottom: 1px solid #000;
        display: inline-block;
        min-width: 200px;
    }
    
    .cert-body {
        margin: 2rem 0;
        line-height: 2;
    }
    
    table.cert-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 2rem;
    }
    table.cert-table th, table.cert-table td {
        border: 1px solid #000;
        padding: 0.8rem;
    }
    table.cert-table th {
        background: #f0f0f0;
        width: 30%;
        text-align: left;
    }
    
    .issuer-block {
        margin-top: 4rem;
        float: right;
        width: 50%;
        text-align: left;
    }
    .issuer-seal {
        position: absolute;
        bottom: 4rem;
        right: 4rem;
        width: 80px;
        height: 80px;
        border: 3px solid #d00;
        border-radius: 50%;
        color: #d00;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.9rem;
        font-weight: bold;
        transform: rotate(-10deg);
        opacity: 0.8;
        pointer-events: none;
    }
    .verification-status {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-family: sans-serif;
        font-size: 0.8rem;
        color: #2e7d32;
        border: 1px solid #2e7d32;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        background: #e8f5e9;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    /* Print settings */
    @media print {
        .verification-status { display: none; }
        body { background: #fff; }
        .cert-container { border: none; margin: 0; padding: 0; }
    }
---

<div class="cert-container">
    <div class="verification-status">
        🔒 Verified by Sorane Inc.
    </div>

    <div class="cert-date">Date: 2026-01-04</div>
    
    <div class="recipient">To: Mr. Taro Sorane</div>

    <div class="cert-title">CERTIFICATE OF EMPLOYMENT</div>

    <div class="cert-body">
        This is to certify that the person named below is employed by our company as follows:
    </div>

    <table class="cert-table">
        <tr>
            <th>Employee Name</th>
            <td>Taro Sorane</td>
        </tr>
        <tr>
            <th>Date of Birth</th>
            <td>1990-05-15</td>
        </tr>
        <tr>
            <th>Department</th>
            <td>Engineering Division, Cloud Infrastructure Team</td>
        </tr>
        <tr>
            <th>Position</th>
            <td>Senior Software Engineer</td>
        </tr>
        <tr>
            <th>Employment Date</th>
            <td>2020-04-01</td>
        </tr>
        <tr>
            <th>Employment Status</th>
            <td>Full-time (Permanent)</td>
        </tr>
        <tr>
            <th>Annual Salary (Prev. Year)</th>
            <td>JPY 8,500,000</td>
        </tr>
    </table>

    <div class="issuer-block">
        <p><strong>Employer:</strong> Sorane Inc.</p>
        <p><strong>Address:</strong> 1-1-1 Tech Valley, Shibuya-ku, Tokyo, Japan</p>
        <p><strong>Representative:</strong> Masanori Kusunoki, CEO</p>
    </div>

    <div class="issuer-seal">
        Sorane<br>Inc.<br>Seal
    </div>

    <div style="clear:both;"></div>
</div>

<div style="text-align:center; margin-top:2rem; font-family:sans-serif; color:#666; font-size:0.9rem;">
    <p>This document acts as a verified digital proof of employment.</p>
    <details>
        <summary style="cursor:pointer; color:#0056b3;">View JSON-LD Data (System Readable)</summary>
        <pre style="text-align:left; background:#f4f4f4; padding:1rem; border-radius:8px; overflow-x:auto; max-width:600px; margin:1rem auto;">
{
  "@context": "https://schema.org",
  "@type": "EmployeeRole",
  "employee": {
    "@type": "Person",
    "name": "Taro Sorane",
    "birthDate": "1990-05-15"
  },
  "employer": {
    "@type": "Organization",
    "name": "Sorane Inc.",
    "address": "1-1-1 Tech Valley, Shibuya-ku, Tokyo, Japan",
    "founder": { "@type": "Person", "name": "Masanori Kusunoki" }
  },
  "roleName": "Senior Software Engineer",
  "startDate": "2020-04-01",
  "baseSalary": {
    "@type": "PriceSpecification",
    "price": 8500000,
    "priceCurrency": "JPY",
    "referenceQuantity": { "@type": "QuantitativeValue", "unitCode": "ANN" }
  }
}
        </pre>
    </details>
</div>

<script type="application/json" id="wa-input-data">
{
    "@context": "https://schema.org",
    "@type": "EmployeeRole",
    "employee": {
        "@type": "Person",
        "name": "Taro Sorane",
        "birthDate": "1990-05-15"
    },
    "employer": {
        "@type": "Organization",
        "name": "Sorane Inc.",
        "address": "1-1-1 Tech Valley, Shibuya-ku, Tokyo, Japan",
        "founder": { "@type": "Person", "name": "Masanori Kusunoki" }
    },
    "roleName": "Senior Software Engineer",
    "startDate": "2020-04-01",
    "baseSalary": {
        "@type": "PriceSpecification",
        "price": 8500000,
        "priceCurrency": "JPY",
        "referenceQuantity": { "@type": "QuantitativeValue", "unitCode": "ANN" }
    }
}
</script>
