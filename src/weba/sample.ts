
export const DEFAULT_MARKDOWN_EN = `# Simple Search & Calc Test
---

## 1. Master Data Definition
(This will be hidden in the UI but used for search)

[master:products]
| Item Name | Price |
|---|---|
| Apple | 100 |
| Banana | 200 |
| Cherry | 300 |
| Durian | 5000 |
| Elderberry | 400 |

---

## 2. Input Form

We want to verify:
1. Search suggestion works for "Product"
2. Calculation works for "Total"

[dynamic-table:items]
| Product (Search) | Unit Price | Qty | Total |
|---|---|---|---|
| [search:item_name (src:products placeholder="Search fruit...")] | [number:price (placeholder="0")] | [number:qty (placeholder="1" val="1")] | [calc:amount (formula="price * qty")] |

<div style="text-align: right; margin-top: 10px;">
  <b>Grand Total:</b> [calc:grand_total (formula="SUM(amount)" size:L bold)]
</div>
`;

export const DEFAULT_MARKDOWN_JA = `# 請求書（サンプル）
---

## 1. マスタ定義
(画面には表示されませんが、検索候補として使用されます)

[master:商品]
| 商品名 | 単価 |
|---|---|
| りんご | 100 |
| バナナ | 200 |
| みかん | 150 |
| 高級メロン | 5000 |

---

## 2. 入力フォーム

[dynamic-table:items]
| 商品名 (検索) | 単価 | 数量 | 小計 |
|---|---|---|---|
| [search:商品名 (src:商品 placeholder="商品を検索")] | [number:単価 (placeholder="0")] | [number:数量 (placeholder="1" val="1")] | [calc:小計 (formula="単価 * 数量")] |

<div style="text-align: right; margin-top: 10px;">
  <b>合計金額:</b> [calc:総合計 (formula="SUM(小計)" size:L bold)]
</div>
`;
