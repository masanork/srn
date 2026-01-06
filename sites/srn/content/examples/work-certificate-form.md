---
title: 就労証明書（入力フォーム）
layout: form
description: "Web/A形式による標準的な就労証明書の入力フォームです。"
---

# 就労証明書

下記の内容について、事実であることを証明いたします。

## 1. 証明日・事業者情報

| 項目 | 入力フィールド |
| --- | --- |
| 証明日 | [date:issuer.date (required)] |
| 事業所名 | [text:issuer.name (required placeholder="株式会社サンプル")] |
| 代表者名 | [text:issuer.representative (required placeholder="代表 太郎")] |
| 所在地 | [search:issuer.zip (autofill:postal:zip placeholder="郵便番号")]<br>[text:issuer.address (autofill:postal:address placeholder="住所")] |
| 電話番号 | [text:issuer.phone (placeholder="03-1234-5678")] |
| 担当者名 | [text:issuer.contact_person (placeholder="総務 担当")] |
| 担当者連絡先 | [text:issuer.contact_phone (placeholder="03-1234-5679")] |

## 2. 就労者（本人）情報

| 項目 | 入力フィールド |
| --- | --- |
| 本人氏名 | [text:employee.name (required placeholder="山田 太郎")] |
| フリガナ | [text:employee.kana (required placeholder="ヤマダ タロウ")] |
| 生年月日 | [date:employee.birth_date (required)] |

## 3. 雇用(予定)期間等

| 項目 | 入力フィールド |
| --- | --- |
| 雇用形態 | [radio:employment.type]<br>- 無期<br>- 有期 |
| 雇用開始日 | [date:employment.start_date (required)] |
| 雇用終了日 | [date:employment.end_date (placeholder="有期の場合のみ入力")] |

## 4. 就労場所

| 項目 | 入力フィールド |
| --- | --- |
| 事業所名称 | [text:workplace.name (placeholder="本社と異なる場合に記載")] |
| 所在地 | [text:workplace.address (placeholder="所在地が異なる場合に記載")] |

## 5. 雇用の形態

| 項目 | 入力フィールド |
| --- | --- |
| 形態 | [radio:employment.status]<br>- 正社員<br>- パート・アルバイト<br>- 派遣社員<br>- 契約社員<br>- 会計年度任用職員<br>- 非常勤・臨時職員<br>- 役員<br>- 自営業主<br>- 自営業専従者<br>- 家族従業者<br>- 内職<br>- 業務委託<br>- その他 |
| その他詳細 | [text:employment.status_other (placeholder="その他を選択した場合に記入")] |

## 6. 就労時間

### 固定就労の場合

| 曜日 | 就労日チェック |
| --- | --- |
| 月曜日 | [checkbox:work_hours.fixed.mon] 月曜 |
| 火曜日 | [checkbox:work_hours.fixed.tue] 火曜 |
| 水曜日 | [checkbox:work_hours.fixed.wed] 水曜 |
| 木曜日 | [checkbox:work_hours.fixed.thu] 木曜 |
| 金曜日 | [checkbox:work_hours.fixed.fri] 金曜 |
| 土曜日 | [checkbox:work_hours.fixed.sat] 土曜 |
| 日曜日 | [checkbox:work_hours.fixed.sun] 日曜 |
| 祝日 | [checkbox:work_hours.fixed.holiday] 祝日 |

| 項目 | 入力フィールド |
| --- | --- |
| 1ヶ月当たりの就労時間 | [number:work_hours.fixed.monthly_hours] 時間 |
| うち休憩時間 | [number:work_hours.fixed.monthly_rest_minutes] 分 |
| 1ヶ月当たりの就労日数 | [number:work_hours.fixed.monthly_days] 日 |
| 1週間当たりの就労日数 | [number:work_hours.fixed.weekly_days] 日 |

#### 時間帯（固定）

| 区分 | 開始 | 終了 | 休憩(分) |
| --- | --- | --- | --- |
| 平日 | [text:work_hours.fixed.weekday_start (placeholder="09:00")] | [text:work_hours.fixed.weekday_end (placeholder="18:00")] | [number:work_hours.fixed.weekday_rest] |
| 土曜 | [text:work_hours.fixed.sat_start] | [text:work_hours.fixed.sat_end] | [number:work_hours.fixed.sat_rest] |
| 日祝 | [text:work_hours.fixed.sun_start] | [text:work_hours.fixed.sun_end] | [number:work_hours.fixed.sun_rest] |

### 変則就労の場合

| 項目 | 入力フィールド |
| --- | --- |
| サイクル | [radio:work_hours.irregular.cycle]<br>- 月間<br>- 週間 |
| 合計時間 | [number:work_hours.irregular.total_hours] 時間 [number:work_hours.irregular.total_minutes] 分 |
| 合計日数 | [number:work_hours.irregular.total_days] 日 |
| 主な時間帯 | [text:work_hours.irregular.shift_start] ～ [text:work_hours.irregular.shift_end] (休憩 [number:work_hours.irregular.shift_rest] 分) |

## 7. 就労実績（直近3ヶ月）

| 年月 | 就労日数 | 就労時間数 |
| --- | --- | --- |
| [text:record.m1.date (placeholder="2025年12月")] | [number:record.m1.days] 日 | [number:record.m1.hours] 時間 |
| [text:record.m2.date] | [number:record.m2.days] 日 | [number:record.m2.hours] 時間 |
| [text:record.m3.date] | [number:record.m3.days] 日 | [number:record.m3.hours] 時間 |

## 8. 休暇取得状況等

| 項目 | 状況 | 期間 |
| --- | --- | --- |
| 産前・産後休業 | [radio:leave.maternity.status]<br>- 取得予定<br>- 取得中 | [date:leave.maternity.start] ～ [date:leave.maternity.end] |
| 育児休業 | [radio:leave.childcare.status]<br>- 取得予定<br>- 取得中<br>- 取得済み | [date:leave.childcare.start] ～ [date:leave.childcare.end] |
| その他休業 | [radio:leave.other.status]<br>- 取得予定<br>- 取得中<br>- 取得済み | [date:leave.other.start] ～ [date:leave.other.end] |
| 休業理由 | [text:leave.other.reason (placeholder="介護、病休など")] | |

## 9. 復職・短時間勤務

| 項目 | 入力フィールド |
| --- | --- |
| 復職(予定)年月日 | [date:return_to_work.date] |
| 短時間勤務利用 | [radio:short_hours.status]<br>- 取得予定<br>- 取得中 |
| 短時間勤務期間 | [date:short_hours.start] ～ [date:short_hours.end] |
| 短時間勤務時間帯 | [text:short_hours.start_time] ～ [text:short_hours.end_time] |

## 10. その他・備考

| 項目 | 入力フィールド |
| --- | --- |
| 保育士としての勤務 | [radio:others.nursery_teacher]<br>- 有<br>- 有（予定）<br>- 無 |
| 雇用契約の更新 | [radio:others.contract_renewal]<br>- 有<br>- 有（予定）<br>- 無<br>- 未定 |
| 育休短縮可否 | [radio:others.childcare_shorten]<br>- 可<br>- 可（予定）<br>- 否 |
| 備考欄 | [text:others.remarks (placeholder="特記事項があれば記入")] |

---
以上の通り、相違ないことを証明します。
