---
title: "WebUSB Feasibility Investigation"
date: 2026-01-01
status: DRAFT
description: "Investigation into Cross-Platform WebUSB Support for JPKI/IC Card Access"
ai_generated: true
---

# WebUSB Feasibility Report: Cross-Platform Analysis

**Date:** 2026-01-01
**Context:** Investigation for direct IC card (My Number Card/JPKI) access from browsers.

## 1. Executive Summary

*   **Android / Chrome OS**: ✅ **Excellent**. The most seamless platforms for WebUSB.
*   **macOS / Linux**: ⚠️ **Good**, but requires the device to be unclaimed by OS drivers (HID/Keyboard conflicts).
*   **Windows**: ⚠️ **Problematic**. Requires `WinUSB` driver installation effectively breaking "seamless" usage for general users.
*   **iOS / iPadOS**: ❌ **Impossible**. Not supported by WebKit/OS policies.

## 2. Platform Breakdown

### 2.1. Chrome OS & Android (Best Case)
These platforms are the "native home" of WebUSB.
*   **Status**: Native Support via Chrome.
*   **Driver**: No manual driver installation required.
*   **Experience**: Plug & Play. The browser requests permission, user grants it, and raw USB access is available.
*   **JPKI Relevance**: Ideally suited for "Mobile PoC" on Android if we used a standard USB reader (ACR122U etc). However, most users expect **NFC**, not USB readers, on mobile. **WebNFC** acts as the alternative here (though limited, see separate report).

### 2.2. macOS & Linux
*   **Status**: Native Support via Chrome/Edge.
*   **Driver**: No custom driver needed.
*   **Constraint (OS Claiming)**: The biggest hurdle is if the OS "claims" the device first.
    *   Example: A standard IC Card Reader might be claimed by the `ccid` (Smart Card) driver of the OS to make it available to the web browser via PC/SC.
    *   **Conflict**: WebUSB can only claim "unclaimed" devices. If macOS sees a Smart Card Reader and loads its own driver, **WebUSB cannot access it**. You would need to unload the kernel extension, which is not feasible for end users.

### 2.3. Windows (The "WinUSB" Barrier)
*   **Status**: Supported, but with major UX friction.
*   **The Issue**: Windows does not allow generic USB access unless the device is bound to the `WinUSB.sys` driver.
*   **Reality**: Most IC Card Readers come with vendor drivers or use Microsoft's CCID class driver.
*   **Workaround**: Users must use tools like **Zadig** to replace the standard driver with `WinUSB`.
    *   **Verdict**: unacceptable for a consumer-facing government service (JPKI). Asking citizens to replace system drivers is a non-starter.

### 2.4. iOS & iPadOS (The Blocker)
*   **Status**: **Not Supported**.
*   **Reason**: Apple's WebKit engine (which powers Safari, Chrome, and Firefox on iOS) does not implement the WebUSB API standard.
*   **Constraint**: Lightning/USB-C ports on iPhones are strictly managed. Only specific accessories are allowed.
*   **Workaround**: None. Native App is mandatory for direct hardware access.

## 3. Comparison with Web Smart Card API

The **Web Smart Card API** (a different proposal) was designed exactly to solve the "OS Claiming" issue mentioned in macOS/Windows sections.
*   **Goal**: Allow accessing PC/SC (CCID) devices *through* the browser, leveraging the OS driver instead of fighting it.
*   **Status**: **Dead/Stalled**. No major browser has shipped this due to fingerprinting and security concerns.

## 4. Conclusion for JPKI Strategy

**WebUSB is not a silver bullet for JPKI.**

1.  **Mobile**: Android works, but iOS is dead. Since >50% of JP users are on iPhone, a WebUSB-only solution is incomplete.
2.  **Desktop**: Windows/macOS driver conflicts (PC/SC vs WebUSB) make it unstable for mass deployment.
3.  **Recommendation**:
    *   **Mobile**: Use **Native App Bridge** (Scheme/Universal Links) as concluded in the WebNFC report.
    *   **Desktop**: Use **Localhost Bridge App** (similar to existing JPKI clients) or wait for a Native App companion. Direct browser access remains a "Holy Grail" blocked by OS security models.
