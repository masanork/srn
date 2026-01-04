---
title: "Submit Button Validation Test"
layout: form
---

# Submit Button Validation Test

Test form for validating the new submit button visual validation system.

## Test Case 1: Required Fields

| Field | Input |
|---|---|
| Name | [text:name (required placeholder="Enter your name")] |
| Email | [text:email (required placeholder="email@example.com")] |
| Phone | [text:phone (placeholder="Optional")] |

## Test Case 2: Optional Fields Only

| Field | Input |
|---|---|
| Company | [text:company] |
| Department | [text:department] |
| Notes | [textarea:notes] |

## Test Case 3: Mixed Fields with Show If

| Field | Input |
|---|---|
| Country | [text:country (required)] |
| State | [text:state (show_if="country=='USA'" required)] |
| City | [text:city (required)] |
| Preferred Method | [text:preferred_method (required placeholder="Email, Phone, or Mail")] |
