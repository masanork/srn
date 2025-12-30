---
title: "Product Team Response: Guardrail Implementation Plan Based on Red Team Input (v7)"
layout: article
author: "Web/A Product Team (Tech Lead)"
date: 2024-12-31
description: "Reporting specific operational constraints and technical implementation measures in response to the Red Team's PoC approval and guardrails (v7)."
ai_generated: true
---

## 1. Introduction: Appreciation for the Endorsement of Relative Security Improvement

The Web/A Product Team (the "Team") has received the conditional endorsement (v7) from the Red Team regarding the early deployment of PoCs using the current Web/A reference implementation.

We appreciate the agreement to proceed with replacing current vulnerable data exchange methods (Email, PPAP, etc.) with a more robust (though incomplete) prototype. Based on the guardrails provided, we have formulated the following implementation and operational plan.

---

## 2. Specific Implementation Plan for Guardrails

### 2.1. Data Classification and Template-Based Constraints
To prevent the inclusion of sensitive information due to a "Security Illusion," we will take the following measures:
- **Restricted Template Operation**: We will limit the freedom of form creation and deploy PoCs using only "Low-to-Medium Confidentiality (General Administrative)" templates audited by the Team.
- **Guidelines for Creators**: 
    - We will explicitly prohibit fields requesting **"Special Care-Required Personal Information (medical history, creed, etc.)"** or high-risk credentials like **"passwords for other services"** until sufficient protection measures are in place.
    - **Handling of National IDs (My Number)**: National IDs will be permitted within appropriately configured templates only when there is a clear practical necessity, in full compliance with relevant laws and personal information protection guidelines.

### 2.2. Explicit Status Representation in UI
To ensure users are always aware they are using a "system in development," we will display two-tiered warnings:
- **System Header**: A prominent red label stating "Experimental / Pilot Phase" will be added to the Web/A Maker and Verifier headers, with a link to a risk explanation page.
- **Document Watermark**: A "Pilot Phase Document" watermark will be automatically inserted into the background or footer of generated Web/A HTML documents, ensuring the warning remains visible during printing or forwarding.

### 2.3. Mandatory TTL in Web/A Post and Alignment with Retention Policies
- **Provisional TTL Setting**: While adopting the 72-hour policy suggested by the Red Team as a baseline, we will coordinate with relevant departments regarding the obligation to preserve "Audit Trails of Receipt" under document management regulations.
- **Implementation Strategy**: Upon delivery completion, the message body (encrypted envelope) will be promptly deleted from the Post. We are considering a configuration where only minimal metadata (Proof of Delivery)—stating who sent what, to whom, and when—is retained for the required legal period.

### 2.4. Provisional Measures for Replay Control
While awaiting the full replay guard implementation in the WASM layer, we will introduce the following:
- **ID Expectation Check**: The Verifier will include logic to cross-reference document `nonces` or `thread_ids` against a "known received list" at the application layer, rejecting duplicate receipts of the same ID.

---

## 3. Additional Security Diligence

To further mitigate the Red Team's concerns, the Team will include the following items in the PoC:

1.  **Enforced HMP (Human-Machine Parity) Verification**: 
    To prevent data exfiltration via "hidden fields," we will strengthen the feature where an AI Agent or script checks for differences between "what the human sees on screen" and "what is exported in JSON-LD," issuing a warning if a discrepancy exists.
2.  **Key Rollover Drills**: 
    To prepare for potential future key compromises, we will conduct unannounced operational tests of "Emergency Epoch Key Revocation and Reissue" during the PoC period, demonstrating rapid recovery even under incomplete key management.

## 4. Conclusion

The Team is confident that by adhering to these guardrails, we can substantially reduce risks associated with current email-based administrative work while accelerating the technical maturity required for the next generation of "Loosely Coupled Trust."

We look forward to any further concerns or guidance regarding changes in priority from the Red Team.

End of Report.
