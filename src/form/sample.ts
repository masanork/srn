const AGG_BLOCK_EN = [
  "```agg",
  "version: 0.1",
  "samples:",
  "  - responder_name: Akira",
  "    team_name: Platform",
  "    cuisine: Japanese",
  "    budget: 5000",
  "    availability:",
  "      - date: 2026-01-05",
  "        available: true",
  "      - date: 2026-01-07",
  "        available: true",
  "      - date: 2026-01-12",
  "        available: true",
  "  - responder_name: Mei",
  "    team_name: Design",
  "    cuisine: Italian",
  "    budget: 7000",
  "    availability:",
  "      - date: 2026-01-06",
  "        available: true",
  "      - date: 2026-01-08",
  "        available: true",
  "      - date: 2026-01-14",
  "        available: true",
  "  - responder_name: Ken",
  "    team_name: Sales",
  "    cuisine: BBQ",
  "    budget: 11000",
  "    availability:",
  "      - date: 2026-01-05",
  "        available: true",
  "      - date: 2026-01-09",
  "        available: true",
  "      - date: 2026-01-16",
  "        available: true",
  "  - responder_name: Yui",
  "    team_name: Ops",
  "    cuisine: Sushi",
  "    budget: 9000",
  "    availability:",
  "      - date: 2026-01-07",
  "        available: true",
  "      - date: 2026-01-13",
  "        available: true",
  "      - date: 2026-01-15",
  "        available: true",
  "  - responder_name: Sora",
  "    team_name: Data",
  "    cuisine: Korean",
  "    budget: 13000",
  "    availability:",
  "      - date: 2026-01-08",
  "        available: true",
  "      - date: 2026-01-12",
  "        available: true",
  "      - date: 2026-01-14",
  "        available: true",
  "  - responder_name: Rin",
  "    team_name: HR",
  "    cuisine: Chinese",
  "    budget: 3000",
  "    availability:",
  "      - date: 2026-01-06",
  "        available: true",
  "      - date: 2026-01-09",
  "        available: true",
  "      - date: 2026-01-15",
  "        available: true",
  "dashboard:",
  "  title: Dinner Poll Dashboard",
  "  cards:",
  "    - id: total_responses",
  "      label: Responses",
  "      op: count",
  "    - id: avg_budget",
  "      label: Avg Budget",
  "      op: avg",
  "      path: budget",
  "      format: currency",
  "  charts:",
  "    - id: availability_by_date",
  "      type: bar",
  "      title: Availability by Date",
  "      source: availability",
  "      x: date",
  "      filter:",
  "        path: available",
  "        op: eq",
  "        value: true",
  "    - id: budget_hist",
  "      type: hist",
  "      title: Budget Distribution (JPY)",
  "      value: budget",
  "      bin: 1000",
  "      max: 15000",
  "      format: currency",
  "export:",
  "  jsonl: true",
  "  parquet: true",
  "```",
].join("\n");

const AGG_BLOCK_JA = [
  "```agg",
  "version: 0.1",
  "samples:",
  "  - responder_name: 明",
  "    team_name: プラットフォーム",
  "    cuisine: 和食",
  "    budget: 5000",
  "    availability:",
  "      - date: 2026-01-05",
  "        available: true",
  "      - date: 2026-01-07",
  "        available: true",
  "      - date: 2026-01-12",
  "        available: true",
  "  - responder_name: 芽衣",
  "    team_name: デザイン",
  "    cuisine: イタリアン",
  "    budget: 7000",
  "    availability:",
  "      - date: 2026-01-06",
  "        available: true",
  "      - date: 2026-01-08",
  "        available: true",
  "      - date: 2026-01-14",
  "        available: true",
  "  - responder_name: 健",
  "    team_name: セールス",
  "    cuisine: 焼肉",
  "    budget: 11000",
  "    availability:",
  "      - date: 2026-01-05",
  "        available: true",
  "      - date: 2026-01-09",
  "        available: true",
  "      - date: 2026-01-16",
  "        available: true",
  "  - responder_name: 結衣",
  "    team_name: オペレーション",
  "    cuisine: 寿司",
  "    budget: 9000",
  "    availability:",
  "      - date: 2026-01-07",
  "        available: true",
  "      - date: 2026-01-13",
  "        available: true",
  "      - date: 2026-01-15",
  "        available: true",
  "  - responder_name: 空",
  "    team_name: データ",
  "    cuisine: 韓国料理",
  "    budget: 13000",
  "    availability:",
  "      - date: 2026-01-08",
  "        available: true",
  "      - date: 2026-01-12",
  "        available: true",
  "      - date: 2026-01-14",
  "        available: true",
  "  - responder_name: 凛",
  "    team_name: 人事",
  "    cuisine: 中華",
  "    budget: 3000",
  "    availability:",
  "      - date: 2026-01-06",
  "        available: true",
  "      - date: 2026-01-09",
  "        available: true",
  "      - date: 2026-01-15",
  "        available: true",
  "dashboard:",
  "  title: 飲み会ダッシュボード",
  "  cards:",
  "    - id: total_responses",
  "      label: 回答数",
  "      op: count",
  "    - id: avg_budget",
  "      label: 平均予算",
  "      op: avg",
  "      path: budget",
  "      format: currency",
  "  charts:",
  "    - id: availability_by_date",
  "      type: bar",
  "      title: 日別の出席可能人数",
  "      source: availability",
  "      x: date",
  "      filter:",
  "        path: available",
  "        op: eq",
  "        value: true",
  "    - id: budget_hist",
  "      type: hist",
  "      title: 予算の分布 (JPY)",
  "      value: budget",
  "      bin: 1000",
  "      max: 15000",
  "      format: currency",
  "export:",
  "  jsonl: true",
  "  parquet: true",
  "```",
].join("\n");

export const DEFAULT_MARKDOWN_EN = `# Team Dinner Poll (Sample)
---

## 1. Participant

- [text:responder_name (placeholder="Akira")] Name
- [text:team_name (placeholder="Platform Team")] Team
- [text:contact (placeholder="akira@example.com")] Contact

---

## 2. Availability (Jan 2026 weekdays)

[dynamic-table:availability]
| Date | Available | Note |
|---|---|---|
| [date:date (val="2026-01-05")] | [checkbox:available] | [text:note (placeholder="After 19:00 ok")] |
| [date:date (val="2026-01-06")] | [checkbox:available] | [text:note (placeholder="Remote only")] |
| [date:date (val="2026-01-07")] | [checkbox:available] | [text:note (placeholder="Leaving early")] |
| [date:date (val="2026-01-08")] | [checkbox:available] | [text:note (placeholder="Any time")] |
| [date:date (val="2026-01-09")] | [checkbox:available] | [text:note (placeholder="After 20:00")] |
| [date:date (val="2026-01-12")] | [checkbox:available] | [text:note (placeholder="Any time")] |
| [date:date (val="2026-01-13")] | [checkbox:available] | [text:note (placeholder="After 19:00")] |
| [date:date (val="2026-01-14")] | [checkbox:available] | [text:note (placeholder="Maybe")] |
| [date:date (val="2026-01-15")] | [checkbox:available] | [text:note (placeholder="Any time")] |
| [date:date (val="2026-01-16")] | [checkbox:available] | [text:note (placeholder="After 19:30")] |

---

## 3. Preferences

- [search:cuisine (src:cuisines label:2 value:2 placeholder="Type or pick a cuisine")] Preferred cuisine
- [number:budget (placeholder="0")] Preferred budget (JPY)
- [textarea:comment (placeholder="Allergies or constraints")] Notes

---

## 4. Master Data (Cuisines)

[master:cuisines]
| code | label |
|---|---|
| Japanese | Japanese |
| Italian | Italian |
| Chinese | Chinese |
| Korean | Korean |
| BBQ | BBQ |
| Sushi | Sushi |
| Seafood | Seafood |
| Vegetarian | Vegetarian |
| Cafe | Cafe |
| Other | Other |

${AGG_BLOCK_EN}
`;

export const DEFAULT_MARKDOWN_JA = `# 飲み会日程調整（サンプル）
---

## 1. 参加者

- [text:responder_name (placeholder="明")] 名前
- [text:team_name (placeholder="プラットフォーム")] チーム
- [text:contact (placeholder="akira@example.com")] 連絡先

---

## 2. 出席可否（2026年1月の平日）

[dynamic-table:availability]
| 日付 | 出席可 | メモ |
|---|---|---|
| [date:date (val="2026-01-05")] | [checkbox:available] | [text:note (placeholder="19時以降OK")] |
| [date:date (val="2026-01-06")] | [checkbox:available] | [text:note (placeholder="オンラインのみ")] |
| [date:date (val="2026-01-07")] | [checkbox:available] | [text:note (placeholder="早めに退出")] |
| [date:date (val="2026-01-08")] | [checkbox:available] | [text:note (placeholder="終日OK")] |
| [date:date (val="2026-01-09")] | [checkbox:available] | [text:note (placeholder="20時以降")] |
| [date:date (val="2026-01-12")] | [checkbox:available] | [text:note (placeholder="終日OK")] |
| [date:date (val="2026-01-13")] | [checkbox:available] | [text:note (placeholder="19時以降")] |
| [date:date (val="2026-01-14")] | [checkbox:available] | [text:note (placeholder="要確認")] |
| [date:date (val="2026-01-15")] | [checkbox:available] | [text:note (placeholder="終日OK")] |
| [date:date (val="2026-01-16")] | [checkbox:available] | [text:note (placeholder="19時半以降")] |

---

## 3. 希望

- [search:cuisine (src:cuisines label:2 value:2 placeholder="料理ジャンルを入力")] 料理の希望
- [number:budget (placeholder="0")] 希望予算 (JPY)
- [textarea:comment (placeholder="アレルギーや条件")] 備考

---

## 4. マスタ（料理ジャンル）

[master:cuisines]
| code | label |
|---|---|
| Japanese | 和食 |
| Italian | イタリアン |
| Chinese | 中華 |
| Korean | 韓国料理 |
| BBQ | 焼肉 |
| Sushi | 寿司 |
| Seafood | 海鮮 |
| Vegetarian | ベジタリアン |
| Cafe | カフェ |
| Other | その他 |

${AGG_BLOCK_JA}
`;
