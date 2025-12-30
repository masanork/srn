---
title: "医療費集計フォーム"
layout: form
description: "Web/A Formによる医療費控除の明細書デモ"
date: 2025-12-27
author: "Sorane Project"
---

# 医療費集計フォーム

- [calc:total_paid (formula="SUM(amount)")] 支払った医療費の金額計
- [calc:total_comp (formula="SUM(comp)")] 補填される金額計

## 詳細

[dynamic-table:details]
| No | 医療を受けた人 | 病院・薬局などの名称 | 診療・治療 | 医薬品購入 | 介護保険サービス | その他の医療費 | 支払った医療費の金額 | 左のうち、補填される金額 | 支払年月日 |
| -- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [autonum:no] | [text:patient (placeholder="全角10文字以内" suggest:column)] | [text:place (placeholder="全角20文字以内" suggest:column)] | [checkbox:cat_med (align:C)] | [checkbox:cat_drug (align:C)] | [checkbox:cat_care (align:C)] | [checkbox:cat_other (align:C)] | [number:amount (placeholder="半角数字")] | [number:comp (placeholder="半角数字")] | [date:date] |