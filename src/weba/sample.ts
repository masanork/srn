
export const DEFAULT_MARKDOWN = `# Simple Search & Calc Test
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
| [search:item_name (src:products placeholder="Search fruit...")] | [number:price (placeholder="0")] | [number:qty (placeholder="1")] | [calc:amount (formula="price * qty")] |

<div style="text-align: right; margin-top: 10px;">
  <b>Grand Total:</b> [calc:grand_total (formula="SUM(amount)" size:L bold)]
</div>
`;
