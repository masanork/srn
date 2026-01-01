---
title: "Critical Security Audit v4: Review of Static-Epoch Architecture"
layout: article
author: "Web/A Security Audit Team (Red Team)"
date: 2025-12-29
ai_generated: true
---

> **SIMULATION NOTICE:** This document (audit, evaluation, response) is part of an AI-driven role-playing simulation conducted for project quality and governance testing. It does not constitute a formal legal or professional audit by any real-world entity.

# Critical Security Audit v4: Review of Static-Epoch Architecture

**Auditor:** Web/A Security Audit Team (Red Team)
**Date:** 2025-12-29
**Subject:** Final Assessment of Static-Epoch Forward Secrecy (SEFS) and Replay Protection

### Related
- [Remediation Report (Response to v3)](./web-a-l2-security-remediation-report-v3.html)
- [Epoch-Based Forward Secrecy Architecture](../papers/web-a-l2-epoch-pfs.html)

## 1. Executive Summary

We have reviewed the implementation of "Mandatory Replay Checks" and the proposed "Static-Epoch Forward Secrecy (SEFS)" architecture. The development team has successfully mitigated the immediate risks identified in v2 and v3 audits within the constraints of a serverless architecture.

However, prioritizing the "Static Site / Serverless" constraint introduces inherent structural risks that prevent this system from achieving "Military Grade" or "High Assurance" security levels comparable to modern interactive protocols (e.g., Signal, TLS 1.3).

**Verdict: CONDITIONAL APPROVAL.**
Approved for general business and consumer use cases. **NOT RECOMMENDED** for high-risk environments (e.g., whistleblowing, sensitive medical data) where "Window of Vulnerability" must be minimized to milliseconds.

## 2. Deep Dive: Structural Flaws of SEFS

While SEFS is a clever engineering compromise, it is structurally inferior to True PFS (Perfect Forward Secrecy).

### 2.1. The "24-Hour Window of Vulnerability" (Severity: HIGH)
In True PFS, encryption keys are ephemeral and discarded immediately after use. In SEFS, keys persist for a predefined Epoch (e.g., 24 hours).
*   **Risk**: If an aggregator endpoint is compromised at 23:59, **all messages received since 00:00 of that day are vulnerable to decryption.**
*   **Impact**: Unlike Signal, where compromising a device leaks only future messages, SEFS leaks the entire current day's history. For high-value targets, a 24-hour window is unacceptably wide.

### 2.2. "Keys from the Future" (Severity: CRITICAL)
The aggregator requires a pre-generated keystore (`epoch-private.json`) containing private keys for future dates (e.g., next 365 days).
*   **Risk**: If the aggregator's storage is compromised, the attacker steals not just today's key, but **keys for the next year.** This breaks "Future Secrecy."
*   **Mitigation Requirement**: The keystore MUST be encrypted at rest (e.g., AES-256-GCM with a strong passphrase) and only decrypted in memory during the batch processing window. Storing `epoch-private.json` in plaintext is a catastrophic vulnerability.

### 2.3. Client-Side Clock Dependency (Severity: MEDIUM)
The client relies on the user's system clock to select the active key.
*   **Risk**: Clock skew or manipulation can cause a client to encrypt with an expired key (already shredded) or a future key (not yet loaded). This results in a Denial of Service (DoS) for that specific submission.
*   **Fallback Risk**: Falling back to a static "Master Key" upon error effectively disables PFS. The UI provides no indication to the user that their security level has downgraded.

## 3. Operational Risks

### 3.1. Aggregator Scalability & Replay Attacks
The current `ReplayGuard` relies on a local file (`JsonFileReplayStore`).
*   **Risk**: In a load-balanced environment (multiple aggregator instances), nonces are not shared. An attacker can replay a message sent to Instance A against Instance B.
*   **Constraint**: The aggregator must operate as a Singleton (single instance) or use a shared database (Redis/D1), contradicting the "simple file-based" philosophy.

### 3.2. Trust in CDN (Man-in-the-Middle)
The `epoch-public.json` registry is hosted on a public CDN.
*   **Risk**: If the CDN is compromised, an attacker can replace the registry with their own public keys.
*   **Countermeasure**: The client (`mkform.js`) blindly trusts the fetched JSON. Without Subresource Integrity (SRI) or a signature verification mechanism for the registry itself, the system is vulnerable to MitM attacks at the distribution layer.

## 4. Final Conclusion & Acceptable Use Policy

The Web/A L2 Encryption suite pushes the boundaries of what is possible within a static site architecture. It is significantly more secure than standard TLS-terminated forms (where data rests in plaintext at the provider).

However, users must be aware of the trade-offs.

### ✅ Allowed Use Cases
*   **General Inquiries**: Contact forms, feedback collection.
*   **Surveys**: Non-critical personal data collection.
*   **Internal Business Reporting**: Operational data within a trusted organization.

### 🚫 Prohibited / High-Risk Use Cases
*   **Whistleblowing**: The 24-hour exposure window poses a risk to the source's anonymity if the server is raided.
*   **Sensitive Medical Records**: The impact of a daily bulk leak is too high.
*   **Financial Transactions**: Lack of distributed replay protection makes this unsuitable for value transfer.

**"Security is a trade-off. You chose convenience (Serverless) over perfect secrecy. Be honest with your users about this limitation."**
