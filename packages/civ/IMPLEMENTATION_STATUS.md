# CIV (Citizen Identity Verification) Implementation Status Report

**Date:** 2026-01-01
**Status:** Alpha (Functions Implemented, some crypto logic mocked)

## 1. Overview
This library (`civ`) aims to provide a unified interface for accessing Japanese public identification cards:
1.  **JPKI** (My Number Card)
2.  **Driver's License** (DL)
3.  **ePassport** (EP)
4.  **Residence Card** (RC)

## 2. Implementation Status by Component

### 2.1. JPKI (My Number Card)
*   ✅ **AP Selection**: Implemented (JPKI AP).
*   ✅ **PIN Verification**: Implemented (User Auth PIN).
*   ✅ **Sign**: Implemented (Compute Digital Signature).
*   ✅ **Read Cert**: Implemented (Read User Auth Cert).
*   ✅ **My Number / Attributes**: Implemented (via "Input Support AP").
*   ⚠️ **Secure Messaging**: Not required for basic JPKI (Basic 4 info uses PIN only).
*   **Remaining**: Signing with "Digital Signature" key (requires 6-16 digit PIN handling).

### 2.2. Driver's License (DL)
*   ✅ **AP Selection**: Implemented.
*   ✅ **PIN Verification**: Implemented (PIN1, PIN2).
*   ✅ **Read Common Data (EF01)**: Implemented.
*   ✅ **Parsing**: Implemented (Shift-JIS TLV parser).
*   ⚠️ **Read Sensitive Data (EF02)**: Implemented but parser not fully detailed.
*   **Remaining**: External character mapping (Gaiji) handling if needed.

### 2.3. ePassport (EP)
*   ✅ **AP Selection**: Implemented.
*   ✅ **BAC Key Derivation**: Implemented (SHA-1 from MRZ).
*   🚧 **Secure Messaging (SM)**: **MOCKED**.
    *   Current: Derives keys but does not encrypt APDUs. Reads are attempted in plain text (will fail on real cards).
    *   Required: ISO 7816-4 Secure Messaging wrapper (Encrypt Command Data, Compute MAC, Unencrypt Response).
*   **Remaining**: PACE (Password Authenticated Connection Establishment) support for newer passports (replacing BAC). Active Authentication (AA) / Chip Authentication (CA).

### 2.4. Residence Card (RC)
*   ✅ **AP Selection**: Implemented.
*   ✅ **Access Control**: Implemented (Card Number verification).
*   ✅ **Read Info**: Implemented.
*   ✅ **Parsing**: Implemented (TLV Parser, encoding TBD).
*   **Remaining**: Verify specific encoding (UTF-8 vs Shift-JIS) on real cards.

## 3. Security Hardening & Next Steps

### 3.1. Secure Messaging (Priority: High)
*   **Target**: Passport (BAC/PACE) & potentially Residence Card.
*   **Task**: Implement the `SecureChannel` trait.
    *   `encrypt_apdu(apdu, session_keys) -> encrypted_apdu`
    *   `decrypt_response(response, session_keys) -> decrypted_data`
*   **Crypto**: Needs 3DES (for BAC) and AES (for PACE/newer specs).

### 3.2. Zeroization (Priority: Medium)
*   **Target**: All PINs and Private Keys.
*   **Task**: Ensure `zeroize` crate is applied to all structs holding PINs or session keys to prevent memory dumps.

### 3.3. Error Handling (Priority: Low)
*   **Refinement**: Convert generic `anyhow` errors to specific `CivError` enum (e.g., `PinLocked`, `CardRemoved`, `AuthFailed`).

### 3.4. Testing (Priority: High)
*   **Mocking**: Currently using `mockall`. Need more comprehensive APDU traces for regression testing.
*   **Real Card**: CI integration with physical readers is difficult; need a "Virtual Card" simulator or recorded session replay.
