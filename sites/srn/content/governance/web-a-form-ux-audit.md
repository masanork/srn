---
title: "Web/A Form UX/UI Audit Report (v1)"
layout: article
date: 2025-12-31
description: "Comprehensive audit of Web/A Form's user experience with a focus on mobile adoption and 'Minimum Lovable Product' standards."
---

# Web/A Form UX/UI Audit: The Path to "Minimum Lovable Product"

**Date:** 2025-12-31  
**Auditor:** Antigravity (AI Agent)

## 1. Executive Summary

This audit evaluates the current Web/A Form client against the goal of becoming a **"Trojan Horse" for SRN adoption**.
**Conclusion:** The current implementation is functionally competent but **UX-deficient**. It feels like a "digitized paper document" rather than a "modern web application." To drive adoption, we must pivot from "Form" to "App" experience.

## 2. Critical Issues & Recommendations

### 2.1 Mobile Experience (The "Smartphone First" Gap)
**Current Status:**
*   Layout is "responsive" but not "mobile-optimized."
*   Touch targets (tabs, buttons) are too small (< 44px).
*   Input fields lack semantic types (e.g., `type="tel"`, `inputmode="numeric"`) triggering wrong keyboards.

**Recommendations:**
1.  **Mobile-First CSS:** Redesign the default CSS (`generator.ts`) to stack labels and inputs vertically on small screens.
2.  **Thumb Zone Navigation:** Move primary actions (Save, Submit) to a sticky bottom bar on mobile.
3.  **Haptic/Visual Feedback:** Add distinct visual states (focus rings, button presses) for touch interactions.

### 2.2 Input Intelligence (The "Smart Assistant" Gap)
**Current Status:**
*   "Auto-Copy" exists but is rudimentary.
*   No standard browser autofill support (lack of `autocomplete` attributes).
*   No "Scan to Input" (Camera integration) for physical documents.

**Recommendations:**
1.  **Semantic Autocomplete:** Add rigorous `autocomplete` attributes (e.g., `name`, `email`, `organization`) to allow one-tap filling from the browser/OS.
2.  **"Magic" Postal Code:** Implement a lightweight JP postal code lookup (client-side or cached API) to auto-fill addresses.
3.  **Calculator Real-time Feedback:** Ensure calculated fields update instantly and visibly (flash/highlight) when dependencies change.

### 2.3 Visual Polish & Affordance (The "Premium" Gap)
**Current Status:**
*   Generic `sans-serif` font looks like a default HTML page.
*   "EXPERIMENTAL" watermark is intrusive and reduces trust for Pilot users.
*   Error messages (if any) are likely browser defaults or alerts.

**Recommendations:**
1.  **Typography Upgrade:** Embed a subsetted **Noto Sans JP** (or use system modern stacks like `system-ui`) to immediately improve perceived quality.
2.  **Validation UI:** Replace browser alerts with **Inline Error Messages** and **Field Highlighting**. Use red/green color cues for valid/invalid states.
3.  **Pilot Branding:** Replace the scary "EXPERIMENTAL" banner with a professional "Pilot Preview" badge that implies exclusivity rather than instability.

### 2.4 "Trojan Horse" Features
To make users *want* to use this over paper/PDF:
1.  **Offline-First:** Ensure the form works 100% offline (Service Worker or distinct "Save to Device" feature).
2.  **PDF/Excel Export:** Allow users to export the structured data back to a "legacy" format (PDF/Excel) if their boss demands it. This lowers the barrier to entry.

## 3. Prioritized Roadmap (Q1 2026 Simulation)

| Phase | Focus | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1 (Immediate)** | **Visual & Mobile Baseline** | New CSS, Mobile layout, Better Fonts, Sticky Actions. |
| **Phase 2 (Function)** | **Input Intelligence** | Autocomplete attributes, Postal Lookup, Validation UI. |
| **Phase 3 (Expansion)** | **Trojan Features** | Local Save/Resume, PDF Export (Client-side). |

## 4. Conclusion
The technology is ready; the interface is not. By executing this audit, we transform Web/A Form from a "test tool" into a "product" that users will advocate for.
