---
title: "Web/A Verifier LTV Fit & Gap Analysis"
layout: article
author: "Web/A Technical Lead"
date: 2026-01-03
description: "Analysis of the current Verifier implementations (CLI & Web) against the LTV architecture, identifying gaps in PHC, Timestamping, and Container verification."
ai_generated: true
simulated_governance: true
---

## 1. Introduction

Following the successful implementation of the Web/A LTV Container format (Phase 1-3), we performed an audit of the verification tools to ensure they can correctly interpret and validate the new data structures.

**Scope:**
*   **CLI Verifier**: `weba-verify` (CI/CD use)
*   **Web Verifier**: `verify-app.ts` (End-user use)

## 2. Fit & Gap Analysis

| Feature | CLI Verifier (`weba-verify`) | Web Verifier (`verify-app`) | LTV Requirement | Status |
| :--- | :--- | :--- | :--- | :--- |
| **L2 Signature (VC)** | ✅ **Verified**<br>Checks Ed25519 & PQC signatures. | ✅ **Verified**<br>Checks signatures via drag-and-drop. | Confirm content authenticity. | **Good** |
| **L3 Context (PHC)** | ❌ **Ignored**<br>Does not parse `weba-context-chain`. | ❌ **Ignored**<br>No visualization or verification of history. | Verify Chain of Custody (Updates, Transfers). | **Critical Gap** |
| **L4 Container Sig** | ❌ **Ignored**<br>Treats HTML as just a text source. | ❌ **Ignored**<br>Does not verify the HTML wrapper hash. | Ensure UI integrity (Anti-tampering). | **High Gap** |
| **Trust Store** | ⚠️ **Manual**<br>Requires `--did` flag for local docs. | ⚠️ **Partial**<br>Loads DIDs but ignores other fields. | Offline verification (DIDs, CRLs). | **Medium Gap** |
| **Timestamping** | ❌ **Ignored** | ❌ **Ignored**<br>Does not check `trustedTimestamps`. | Prove existence at specific time. | **Critical Gap** |

## 3. Detailed Findings

### 3.1. CLI Verifier
The CLI tool is currently a "Payload Verifier" rather than a "Container Verifier." It extracts the JSON-LD VC and verifies it in isolation. It fails to utilize the embedded LTV data, meaning it requires an online connection (or manual setup) to verify DIDs, and it cannot detect if the container (HTML) has been tampered with around the payload.

### 3.2. Web Verifier
The Web Verifier has basic support for the embedded Trust Store (loading DID Documents), but it lacks the logic to utilize the new LTV features:
*   **Timestamps**: The `trustedTimestamps` array in the Trust Store is currently ignored.
*   **Pruning**: It does not understand the Prunable Hash Chain, so it cannot verify the lineage of a pruned document.

## 4. Recommendations

We recommend a 3-Step Refactoring Plan:

### Step 1: Core Logic Upgrade (`src/core/verify-ltv.ts`)
Create a new shared verification module that:
1.  Parses the full HTML Container structure (L2, L3, L4, Trust Store).
2.  Verifies the **L4 Container Signature** first (integrity check).
3.  Verifies the **L3 PHC** (chain consistency).
4.  Verifies the **L2 Payload Signature** using the **Trust Store**.
5.  Verifies **Timestamps** against the L2/L3 hashes.

### Step 2: Web UI Enhancements
Update the Web Verifier to display:
*   **Timeline View**: Visualizing the PHC events (Genesis -> Update -> Current).
*   **"Sealed At" Badge**: Showing the trusted timestamp.
*   **Offline Status**: Indicating if verification was performed fully offline.

### Step 3: CLI Alignment
Update `weba-verify` to use the new core module, enabling full container audits in CI/CD pipelines.

---
**Conclusion**: The current Verifiers are "LTV-Blind." Immediate action is required to surface the value of the LTV architecture to users.
