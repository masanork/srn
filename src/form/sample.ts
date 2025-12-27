
export const DEFAULT_MARKDOWN_EN = `# IT Services Estimate (Sample)
---

## 1. Project Summary

- [text:estimate_id (placeholder="EST-2025-001")] Estimate No.
- [date:issue_date] Issue Date
- [date:valid_until] Valid Until
- [text:client.name (placeholder="ACME Corp.")] Client
- [text:client.contact (placeholder="CTO / Procurement")] Contact
- [text:project.title (placeholder="Cloud Migration & DevOps Setup")] Project Title
- [textarea:project.scope (placeholder="High-level scope, assumptions, exclusions")] Scope Notes

---

## 2. Line Items

[dynamic-table:items]
| Service (Search) | Unit | Unit Price | Qty | Days | Line Total |
|---|---|---|---|---|---|
| [search:service (src:services label:1 value:1 placeholder="Search service...")] | [text:unit (placeholder="day")] | [number:unit_price (placeholder="0")] | [number:qty (placeholder="1" val="1")] | [number:days (placeholder="1" val="1")] | [calc:line_total (formula="unit_price * qty * days")] |

<div style="text-align: right; margin-top: 10px;">
  <b>Subtotal:</b> [calc:subtotal (formula="SUM(line_total)" size:L bold)]<br>
  <b>Tax (10%):</b> [calc:tax (formula="SUM(line_total) * 0.1")]<br>
  <b>Grand Total:</b> [calc:grand_total (formula="SUM(line_total) * 1.1" size:L bold)]
</div>

---

## 3. Terms

- [radio:payment.term] Payment Terms
  - Net 30
  - Net 45
  - Net 60
- [radio:delivery.mode] Delivery Mode
  - Remote
  - On-site
  - Hybrid
- [text:sla.level (placeholder="99.5% availability")] SLA / Support
- [textarea:notes (placeholder="Special conditions, dependencies, NDA notes")] Additional Notes

---

## 4. Master Data (Services)

[master:services]
| service | unit | unit_price | notes |
|---|---|---|---|
| Cloud Architecture Design | day | 180000 | Includes current-state assessment |
| Infrastructure as Code | day | 160000 | Terraform / Pulumi setup |
| CI/CD Pipeline Setup | day | 150000 | GitHub Actions + IaC |
| Security Review | day | 200000 | Threat model & hardening |
| Observability Stack | day | 140000 | Metrics/logs/traces |
| App Modernization | day | 220000 | Containerization |
`;

export const DEFAULT_MARKDOWN_JA = `# IT見積書（サンプル）
---

## 1. プロジェクト概要

- [text:estimate_id (placeholder="EST-2025-001")] 見積番号
- [date:issue_date] 発行日
- [date:valid_until] 有効期限
- [text:client.name (placeholder="ACME株式会社")] 取引先
- [text:client.contact (placeholder="情報システム部")] 担当
- [text:project.title (placeholder="クラウド移行・DevOps導入")] 案件名
- [textarea:project.scope (placeholder="前提条件、対象範囲、除外事項")] 概要メモ

---

## 2. 明細

[dynamic-table:items]
| サービス (検索) | 単位 | 単価 | 数量 | 日数 | 小計 |
|---|---|---|---|---|---|
| [search:service (src:services label:1 value:1 placeholder="サービスを検索")] | [text:unit (placeholder="人日")] | [number:unit_price (placeholder="0")] | [number:qty (placeholder="1" val="1")] | [number:days (placeholder="1" val="1")] | [calc:line_total (formula="unit_price * qty * days")] |

<div style="text-align: right; margin-top: 10px;">
  <b>小計:</b> [calc:subtotal (formula="SUM(line_total)" size:L bold)]<br>
  <b>消費税(10%):</b> [calc:tax (formula="SUM(line_total) * 0.1")]<br>
  <b>合計金額:</b> [calc:grand_total (formula="SUM(line_total) * 1.1" size:L bold)]
</div>

---

## 3. 条件

- [radio:payment.term] 支払条件
  - 月末締め翌月末払い
  - 月末締め翌々月末払い
  - 60日サイト
- [radio:delivery.mode] 実施形態
  - リモート
  - 常駐
  - ハイブリッド
- [text:sla.level (placeholder="稼働率99.5%")] SLA/サポート
- [textarea:notes (placeholder="特記事項、NDA、前提条件")] 補足

---

## 4. サービスマスタ

[master:services]
| service | unit | unit_price | notes |
|---|---|---|---|
| クラウド設計 | 人日 | 180000 | 現状調査込み |
| IaC構築 | 人日 | 160000 | Terraform / Pulumi |
| CI/CD導入 | 人日 | 150000 | GitHub Actions |
| セキュリティレビュー | 人日 | 200000 | 脅威分析含む |
| 監視設計 | 人日 | 140000 | メトリクス/ログ |
| アプリ刷新支援 | 人日 | 220000 | コンテナ化 |
`;
