---
title: "Product Team Response: Provisional Reply to Red Team v6 & PoC Policy"
layout: article
author: "Web/A Product Team"
date: 2024-12-31
description: "Addressing the critical analysis from Red Team (v6), organizing mid-to-long term tasks, and questioning the security validity of short-term PoC deployment."
ai_generated: true
---

## 1. Acknowledgment and Future Strategy

The Web/A Product Team has received the detailed analysis (v6) and the requirements [REQ-01] to [REQ-03] from the Red Team.

We recognize that the technical protection of memory management for WebAuthn PRF and user sovereignty in Cloud HSMs are core issues for commercialization. Understanding that addressing these (including the integration of Attestation and investigation of Shamir Sharing) will require careful implementation over the mid-to-long term, we request your patience as the next report (v7) will take some time.

## 2. Inquiry Regarding the Validity of PoC Deployment

In the meantime, the Product Team believes that even before the finalized Tier 3 implementation, the **"Early Deployment of PoCs (Proof of Concepts)"** using the current Web/A reference implementation holds significant value for improving societal security. We would like to ask for the Red Team's perspective on this.

### 2.1. Superiority Over Current "Vulnerable Data Exchange"
Currently, many organizations rely on the following methods for external data exchange:
- **PPAP / Password-protected ZIPs**: Known vulnerabilities and procedural decay.
- **Link & Password File Transfers**: Risks of link leakage and password notification interception.
- **Plaintext Email**: Vulnerability to eavesdropping and tampering during transit.

Compared to these, even the current Web/A Form or Folio/Post prototypes (even if below Tier 2) offer the following improvements:

| Comparison | Superiority of Current Web/A Reference Implementation (PoC) |
| :--- | :--- |
| **Plaintext Email** | Encryption via L2 Envelopes makes eavesdropping at the transit point (Post) physically impossible. |
| **File Transfers** | Tamper detection via PQC signatures and mechanical integrity checks via JSON-LD. |
| **PPAP** | Decryption occurs within the user's client (browser), limiting dependency on relay servers. |

### 2.2. Trade-off Between Risk and Responsibility
Admittedly, operating a Folio or Post PoC increases the management responsibility of the service provider (or Post operator) compared to "send-and-forget" email. However, we believe this is a shift from the catastrophic risk of "plaintext data leaks" to a **"controllable operational risk,"** contributing to an overall higher security level. What is your assessment?

## 3. Request for Red Team Input

Parallel to resolving long-term technical issues, we request a risk assessment perspective from the Red Team on the "safety of step-by-step replacement of current vulnerable data exchange with Web/A PoCs."

Specifically, when comparing Web/A prototypes against the baseline of "current email-based administrative work," we seek your advice on potential blockers or suggested guardrails for early adoption.
