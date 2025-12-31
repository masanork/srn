---
title: "WebNFC Investigation for JPKI"
date: 2026-01-01
status: DRAFT
---

# WebNFC JPKI Feasibility Report

## 1. Conclusion: Not Feasible Directly
**WebNFC cannot currently be used for JPKI (My Number Card) interactions.**

*   **Constraint**: The WebNFC API (`NDEFReader`) is strictly limited to **NDEF (NFC Data Exchange Format)** messages (e.g., reading URLs, text tags).
*   **Requirement**: My Number Cards (ISO/IEC 14443 Type B) require **ISO-DEP** (Data Exchange Protocol) and raw **APDU** (Application Protocol Data Unit) commands (e.g., `SELECT FILE`, `READ BINARY`, `COMPUTE DIGITAL SIGNATURE`).
*   **Gap**: The WebNFC standard explicitly excludes low-level I/O operations like `transceive` or direct APDU access for security and abstraction reasons.

## 2. Alternatives for Mobile PoC

Since direct browser-to-card NFC is impossible via standard web APIs, the "Mobile PoC" must use a native bridge.

### Option A: Minimal Native Wrapper (Recommended)
leverage the existing Rust `jpki` library by compiling it as a shared library for mobile platforms.

*   **Architecture**:
    *   **Core**: `packages/jpki` (Rust) compiled to `.so` (Android/JNI) and `.a` (iOS/FFI).
    *   **UI**: Minimal Android (Kotlin/Compose) or iOS (SwiftUI) app.
    *   **NFC**: Native platform APIs (`android.nfc.tech.IsoDep`, `CoreNFC`) handle the transport.
    *   **Bridge**: The Native App passes the raw APDU from the NFC callback to the Rust `jpki` library, which processes it and returns the response APDU.
*   **Pros**: Reuses 100% of the Rust logic. High performance.
*   **Cons**: Requires app installation (not pure web).

### Option B: External App Integration (Status Quo)
Trigger the official "JPKI Mobile" app via custom URL schemes or Intents.
*   **Pros**: No new crypto code needed.
*   **Cons**: UX is fragmented (app switching). Doesn't prove our library works.

## 3. Future Web Standards
*   **Web Smart Card API**: A proposed standard to allow APDU access. Currently inactive/not implemented in major browsers.
*   **Chrome Flags**: No current flags enable ISO-DEP for WebNFC.

## 4. Recommendation
Proceed with **Option A**. Creating a simple "Card Reader" Android app that uses our Rust crate to display the My Number Card attributes would be a powerful demonstration of the library's portability.
