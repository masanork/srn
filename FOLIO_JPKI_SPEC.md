# Folio JPKI Implementation Specification

**Version:** 0.1.0
**Date:** 2025-12-31

## 1. Overview
This document outlines the architecture and usage of the JPKI (Japanese Public Key Infrastructure) integration within the Folio project. The implementation allows interacting with My Number Cards for authentication and digital signatures via both Native CLI (PC/SC) and Browser (WebUSB) environments.

## 2. Architecture

The codebase relies on a split-crate architecture to separate generic JPKI logic from Folio-specific domain logic.

### 2.1 Packages

*   **`packages/jpki`** (Generic Library)
    *   **Purpose**: Provides generic JPKI interaction capabilities independent of any specific application.
    *   **Components**:
        *   `apdu`: ISO/IEC 7816-4 APDU command builders.
        *   `crypto`: P-256 (ECDSA) signing and verification logic (FIDO-compatible).
        *   `reader`: Abstraction layer for smart card readers (`CardReader` trait).
        *   `native_reader`: PC/SC implementation using `pcsc` crate (Native only).
        *   `transport`: WebUSB wrapper implementation (WASM only).
    *   **Targets**: Rust (Native) and WASM.

*   **`packages/folio-core`** (Application Core)
    *   **Purpose**: Folio-specific domain logic and WASM bindings.
    *   **Components**:
        *   `model`: Data models for Verifiable Credentials (e.g., Juminhyo).
        *   `lib.rs`: Exposes `WasmJpkiController` to JavaScript/TypeScript consumers.
    *   **Dependencies**: Depends on `jpki`.

*   **`packages/folio-cli`** (TypeScript CLI)
    *   **Purpose**: Node.js/Bun-based CLI for managing VCs and VPs.
    *   **Integration**: Uses `folio-core` WASM bindings and `@pokusew/pcsclite` for hardware access.

## 3. CLI Tools

### 3.1 `folio` (TypeScript)
The primary CLI for Folio operations.

*   **Command**: `folio present -i <vc> -a <audience> -o <output> --pin <pin>`
*   **PIN Handling**:
    *   Option: `--pin <VALUE>`
    *   Env Var: `FOLIO_JPKI_PIN`
    *   *Error*: If neither is provided, the command fails (No hardcoded PINs).

### 3.2 `jpki` (Rust Native)
A lightweight diagnostic and utility tool for JPKI cards, similar to `myna`.

*   **Usage**: `cargo run --bin jpki -- <SUBCOMMAND>` (or binary directly)
*   **Subcommands**:
    *   `info`: Check card connection status.
    *   `cert --type auth`: Read and export the User Authentication Certificate.
    *   `sign --data <STRING> --pin <PIN>`: Sign data using the Auth key.
    *   `num --pin <PIN>`: Read My Number (Individual Number).
    *   `attr --pin <PIN>`: Read Card Attributes (Basic 4 Info).
*   **PIN Handling**:
    *   Option: `--pin <VALUE>`
    *   Env Var: `JPKI_PIN`

## 4. Browser Integration (Web/A)

*   **Driver**: `WebUsbCcidDriver` (JavaScript) implements a minimal CCID driver over WebUSB.
*   **Flow**:
    1.  Browser requests device (`navigator.usb`).
    2.  Driver initializes and sends `PC_to_RDR_IccPowerOn`.
    3.  `WasmJpkiController` (via `folio-core` WASM) sends APDUs via the driver.
    4.  Signatures are generated on-card and returned to the browser application.

## 5. Security Notes

*   **PIN Safety**: PINs are never logged or stored in files by the CLI. Users must provide them via runtime arguments or environment variables.
*   **Lockout Risk**: Incorrect PIN entry (3 attempts for Auth, usually) will lock the card. The tools do not currently track retry counts; users must exercise caution.
*   **Testing**: Unit tests cover crypto and APDU logic. Integration tests require physical hardware.
