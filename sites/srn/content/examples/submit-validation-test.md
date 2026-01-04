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
| Email | [email:email_address (required placeholder="email@example.com")] |
| Phone | [tel:phone_number (placeholder="Optional")] |

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

## Test Case 4: Email and Tel Format Validation

Test format validation (warning only, doesn't block submission):

| Field | Input |
|---|---|
| Contact Email | [email:contact_email (required)] |
| Backup Email | [email:backup_email] |
| Mobile Phone | [tel:mobile (required)] |
| Office Phone | [tel:office] |

**Test Instructions:**
- Try invalid email: `invalid.email` → should show red error message
- Try invalid phone: `123` → should show red error message
- Try valid formats → errors should clear
- Submission button should be enabled/disabled based on **required fields only**, not format errors
