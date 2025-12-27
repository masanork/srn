---
title: "就労証明書（世田谷区版）"
layout: form
description: "就労証明書のWeb/A Form版（Excel様式の主要項目を整理）"
date: 2025-01-04
author: "Sorane Project"
---

# 就労証明書（世田谷区版）

### 事業所・証明情報

- [date:certificate.date] 証明日
- [text:employer.name] 事業所名
- [text:employer.representative] 代表者名
- [text:employer.address (placeholder="所在地")] 所在地
- [text:employer.phone (placeholder="03-1234-5678")] 電話番号
- [text:employer.contact_name] 担当者名
- [text:employer.contact_phone] 記載者連絡先

---

### 就労者情報

- [text:employee.kana] フリガナ
- [text:employee.name] 本人氏名
- [date:employee.birth_date] 生年月日

---

### 雇用（予定）期間等

- [radio:employment.term] 雇用（予定）期間
  - 無期
  - 有期
- [date:employment.start_date] 雇用開始日
- [date:employment.end_date] 雇用終了日（有期の場合）

---

### 本人就労先事業所

- [text:workplace.name] 名称
- [text:workplace.address] 住所

---

- [datalist:employment.industry (src:industry label:1 placeholder="業種を入力")] 業種
述）
- [datalist:employment.type (src:employment_type label:1 placeholder="雇用形態を入力")] 雇用の形態

### 就労時間（固定就労）

| 曜日 | 月 | 火 | 水 | 木 | 金 | 土 | 日 | 祝日 | 週間合計（時間） | 月間合計（時間） | 休憩時間（分） |
| -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |
| 出勤 | [checkbox:fixed.mon (align:C)] | [checkbox:fixed.tue (align:C)] | [checkbox:fixed.wed (align:C)] | [checkbox:fixed.thu (align:C)] | [checkbox:fixed.fri (align:C)] | [checkbox:fixed.sat (align:C)] | [checkbox:fixed.sun (align:C)] | [checkbox:fixed.holiday (align:C)] | [number:fixed.week_hours] | [number:fixed.month_hours] | [number:fixed.break_minutes] |

| 平日開始 | 平日終了 | 土曜開始 | 土曜終了 | 日祝開始 | 日祝終了 |
| -- | -- | -- | -- | -- | -- |
| [text:fixed.weekday_start (placeholder="09:00")] | [text:fixed.weekday_end (placeholder="18:00")] | [text:fixed.sat_start (placeholder="09:00")] | [text:fixed.sat_end (placeholder="18:00")] | [text:fixed.sun_start (placeholder="09:00")] | [text:fixed.sun_end (placeholder="18:00")] |

---

### 就労時間（変則就労）

- [number:variable.total_hours] 合計時間（時間/月）
- [radio:variable.unit] 単位
  - 月間
  - 週間
- [number:variable.work_days] 就労日数（日）
- [text:variable.shift_time (placeholder="例: 09:00-18:00")] 主な就労時間帯・シフト時間帯
- [number:variable.break_minutes] 休憩時間（分）

---

### 就労実績（直近3か月）

[dynamic-table:work_records]
| 年月 | 日数/月 | 時間/月 |
| -- | -- | -- |
| [text:ym (placeholder="2025-01")] | [number:days] | [number:hours] |

---

### 休業等の取得状況

- [radio:leave.maternity] 産前・産後休業
  - 取得予定
  - 取得中
- [date:leave.maternity_start] 産前・産後開始日
- [date:leave.maternity_end] 産前・産後終了日

- [radio:leave.childcare] 育児休業
  - 取得予定
  - 取得中
  - 取得済み
- [date:leave.childcare_start] 育児休業開始日
- [date:leave.childcare_end] 育児休業終了日

- [radio:leave.other] 産休・育休以外の休業
  - 取得予定
  - 取得中
  - 取得済み
- [radio:leave.other_reason] 理由
  - 介護休業
  - 病休
  - その他
- [text:leave.other_reason_detail] 理由（その他）
- [date:leave.other_start] 休業開始日
- [date:leave.other_end] 休業終了日

---

### 復職・短時間勤務

- [radio:return.to_work] 復職
  - 復職予定
  - 復職済み
- [date:return.date] 復職（予定）年月日

- [radio:shorttime.use] 育児のための短時間勤務制度
  - 取得予定
  - 取得中
- [date:shorttime.start] 期間（開始）
- [date:shorttime.end] 期間（終了）
- [text:shorttime.shift (placeholder="例: 10:00-16:00")] 主な就労時間帯・シフト時間帯

---

### 保育士等としての勤務実態

- [radio:employment.nursery] 保育士等としての勤務実態
  - 有
  - 有（予定）
  - 無

---

### 備考欄

- [textarea:notes (placeholder="特記事項があれば記載")] 備考

---

### 追加的記載項目

- [radio:additional.tanshin] 就労の状況（単身赴任）
  - 有
  - 無
- [date:additional.tanshin_start] 期間（開始）
- [date:additional.tanshin_end] 期間（終了）

- [radio:additional.employment_insurance] 雇用保険加入状況
  - 加入
  - 非加入

- [number:additional.changed_work_days (placeholder="週あたり日数")] 変更後の就労日数（週）

---

### 保護者記入欄

- [text:child.name] 児童氏名
- [date:child.birth_date] 生年月日
- [text:child.address (placeholder="世田谷区○丁目○番○号")] 住所

---

[master:industry]
| 業種 |
| --- |
| 農業・林業 |
| 漁業 |
| 鉱業・採石業・砂利採取業 |
| 建設業 |
| 製造業 |
| 電気・ガス・熱供給・水道業 |
| 情報通信業 |
| 運輸業・郵便業 |
| 卸売業・小売業 |
| 金融業・保険業 |
| 不動産業・物品賃貸業 |
| 学術研究・専門・技術サービス業 |
| 宿泊業・飲食サービス業 |
| 生活関連サービス業・娯楽業 |
| 医療・福祉 |
| 教育・学習支援業 |
| 複合サービス事業 |
| 公務 |
| その他 |

[master:employment_type]
| 雇用形態 |
| --- |
| 正社員 |
| パート・アルバイト |
| 派遣社員 |
| 契約社員 |
| 会計年度任用職員 |
| 非常勤・臨時職員 |
| 役員 |
| 自営業主 |
| 自営業専従者 |
| 家族従業者 |
| 内職 |
| 業務委託 |
| その他 |
