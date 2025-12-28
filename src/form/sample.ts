export const DEFAULT_MARKDOWN_EN = `# Community Grant Application (Sample)
---

## 1. Applicant

- [text:application_id (placeholder="GRANT-2025-017")] Application ID
- [date:submitted_at] Submitted At
- [text:applicant.name (placeholder="Seaside Youth Lab")] Organization
- [text:applicant.contact (placeholder="Program Lead")] Contact
- [text:applicant.region (placeholder="Kansai")] Region
- [search:applicant.type (src:org_types label:1 value:1 placeholder="Select type")] Org Type

---

## 2. Project Details

- [text:project.title (placeholder="Neighborhood STEM Lab")] Project Title
- [textarea:project.summary (placeholder="Describe impact and beneficiaries")] Summary
- [number:project.budget_total (placeholder="0")] Total Budget (JPY)
- [number:project.request_amount (placeholder="0")] Requested Amount (JPY)
- [number:project.impact_score (placeholder="1-100")] Impact Score
- [number:project.readiness_score (placeholder="1-100")] Readiness Score

---

## 3. Budget Breakdown

[dynamic-table:budget_items]
| Category | Amount | Notes |
|---|---|---|
| [text:category (placeholder="Equipment")] | [number:amount (placeholder="0")] | [text:notes (placeholder="Optional")] |

---

## 4. Master Data (Organization Types)

[master:org_types]
| code | label |
|---|---|
| NPO | NPO |
| Company | Company |
| School | School |
| Individual | Individual |

---

## 5. Review

- [radio:review.recommendation] Recommendation
  - Approve
  - Approve with Changes
  - Hold
  - Reject
- [textarea:review.notes (placeholder="Reviewer notes")] Notes

---

## 6. Aggregator Preview (Sample)

<div data-preview-only="aggregator" style="display:grid; gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr));">
  <div style="grid-column: 1 / -1; font-size: 12px; color: #6b7280;">
    This section is intended for the Aggregator preview. The normal form ignores it.
  </div>
  <div style="padding:12px; border:1px solid #e5e7eb; border-radius:8px;">
    <b>Applications</b><br>
    <span style="font-size:24px;">24</span>
  </div>
  <div style="padding:12px; border:1px solid #e5e7eb; border-radius:8px;">
    <b>Requested Total</b><br>
    <span style="font-size:24px;">¥21,400,000</span>
  </div>
  <div style="padding:12px; border:1px solid #e5e7eb; border-radius:8px;">
    <b>Avg Impact</b><br>
    <span style="font-size:24px;">82.4</span>
  </div>
</div>

\`\`\`agg
version: 0.1
samples:
  - application_id: GRANT-2025-017
    applicant:
      name: Seaside Youth Lab
      type: NPO
      region: Kansai
    project:
      title: Neighborhood STEM Lab
      budget_total: 3200000
      request_amount: 1200000
      impact_score: 86
      readiness_score: 72
    review:
      recommendation: Approve with Changes
  - application_id: GRANT-2025-018
    applicant:
      name: Urban Food Circle
      type: Company
      region: Kanto
    project:
      title: Food Loss Reduction Pilot
      budget_total: 5400000
      request_amount: 2000000
      impact_score: 91
      readiness_score: 80
    review:
      recommendation: Approve
  - application_id: GRANT-2025-019
    applicant:
      name: North Hills High
      type: School
      region: Tohoku
    project:
      title: Remote Science Kits
      budget_total: 2100000
      request_amount: 1500000
      impact_score: 78
      readiness_score: 64
    review:
      recommendation: Hold
  - application_id: GRANT-2025-020
    applicant:
      name: Harbor Climate Studio
      type: NPO
      region: Kyushu
    project:
      title: Climate Storytelling Lab
      budget_total: 4100000
      request_amount: 2300000
      impact_score: 88
      readiness_score: 75
    review:
      recommendation: Approve
dashboard:
  title: Grant Intake Dashboard
  cards:
    - id: total_requests
      label: Applications
      op: count
    - id: total_requested
      label: Requested Total
      op: sum
      path: project.request_amount
      format: currency
    - id: avg_impact
      label: Avg Impact
      op: avg
      path: project.impact_score
  tables:
    - id: by_region
      label: By Region
      group_by: applicant.region
      metrics:
        - id: count
          op: count
        - id: requested
          op: sum
          path: project.request_amount
          format: currency
      sort:
        by: requested
        order: desc
      limit: 10
    - id: by_recommendation
      label: By Recommendation
      group_by: review.recommendation
      metrics:
        - id: count
          op: count
export:
  jsonl: true
  parquet: true
\`\`\`
`;

export const DEFAULT_MARKDOWN_JA = `# 地域助成申請（サンプル）
---

## 1. 申請者情報

- [text:application_id (placeholder="GRANT-2025-017")] 申請ID
- [date:submitted_at] 受付日
- [text:applicant.name (placeholder="港町ユースラボ")] 団体名
- [text:applicant.contact (placeholder="担当者")] 連絡先
- [text:applicant.region (placeholder="関西")] 地域
- [search:applicant.type (src:org_types label:1 value:1 placeholder="団体種別を選択")] 団体種別

---

## 2. プロジェクト内容

- [text:project.title (placeholder="地域STEMラボ")] 事業名
- [textarea:project.summary (placeholder="効果・対象者を記入")] 概要
- [number:project.budget_total (placeholder="0")] 総予算 (JPY)
- [number:project.request_amount (placeholder="0")] 希望助成額 (JPY)
- [number:project.impact_score (placeholder="1-100")] インパクトスコア
- [number:project.readiness_score (placeholder="1-100")] 実行準備スコア

---

## 3. 予算内訳

[dynamic-table:budget_items]
| 項目 | 金額 | 備考 |
|---|---|---|
| [text:category (placeholder="設備")] | [number:amount (placeholder="0")] | [text:notes (placeholder="任意")] |

---

## 4. 団体種別マスタ

[master:org_types]
| code | label |
|---|---|
| NPO | NPO |
| Company | 企業 |
| School | 学校 |
| Individual | 個人 |

---

## 5. 審査

- [radio:review.recommendation] 推奨
  - 採択
  - 条件付き採択
  - 保留
  - 不採択
- [textarea:review.notes (placeholder="審査メモ")] メモ

---

## 6. 集計プレビュー（サンプル）

<div data-preview-only="aggregator" style="display:grid; gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr));">
  <div style="grid-column: 1 / -1; font-size: 12px; color: #6b7280;">
    このセクションは集計プレビュー用の表示例です。
  </div>
  <div style="padding:12px; border:1px solid #e5e7eb; border-radius:8px;">
    <b>申請件数</b><br>
    <span style="font-size:24px;">24</span>
  </div>
  <div style="padding:12px; border:1px solid #e5e7eb; border-radius:8px;">
    <b>希望助成合計</b><br>
    <span style="font-size:24px;">¥21,400,000</span>
  </div>
  <div style="padding:12px; border:1px solid #e5e7eb; border-radius:8px;">
    <b>平均インパクト</b><br>
    <span style="font-size:24px;">82.4</span>
  </div>
</div>

\`\`\`agg
version: 0.1
samples:
  - application_id: GRANT-2025-017
    applicant:
      name: 港町ユースラボ
      type: NPO
      region: 関西
    project:
      title: 地域STEMラボ
      budget_total: 3200000
      request_amount: 1200000
      impact_score: 86
      readiness_score: 72
    review:
      recommendation: 条件付き採択
  - application_id: GRANT-2025-018
    applicant:
      name: 都市フードサークル
      type: 企業
      region: 関東
    project:
      title: 食品ロス削減パイロット
      budget_total: 5400000
      request_amount: 2000000
      impact_score: 91
      readiness_score: 80
    review:
      recommendation: 採択
  - application_id: GRANT-2025-019
    applicant:
      name: 北丘高校
      type: 学校
      region: 東北
    project:
      title: 遠隔実験キット
      budget_total: 2100000
      request_amount: 1500000
      impact_score: 78
      readiness_score: 64
    review:
      recommendation: 保留
  - application_id: GRANT-2025-020
    applicant:
      name: 港湾クライメイトスタジオ
      type: NPO
      region: 九州
    project:
      title: 気候ストーリーテリングラボ
      budget_total: 4100000
      request_amount: 2300000
      impact_score: 88
      readiness_score: 75
    review:
      recommendation: 採択
dashboard:
  title: 助成申請ダッシュボード
  cards:
    - id: total_requests
      label: 申請件数
      op: count
    - id: total_requested
      label: 希望助成合計
      op: sum
      path: project.request_amount
      format: currency
    - id: avg_impact
      label: 平均インパクト
      op: avg
      path: project.impact_score
  tables:
    - id: by_region
      label: 地域別
      group_by: applicant.region
      metrics:
        - id: count
          op: count
        - id: requested
          op: sum
          path: project.request_amount
          format: currency
      sort:
        by: requested
        order: desc
      limit: 10
    - id: by_recommendation
      label: 推奨別
      group_by: review.recommendation
      metrics:
        - id: count
          op: count
export:
  jsonl: true
  parquet: true
\`\`\`
`;
