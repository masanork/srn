# Guest DID Security Fixes & Technical Debt

This document tracks temporary bypasses and security holes introduced during the Guest DID debugging session (Dec 2025). These MUST be resolved before any production deployment.

## 1. Server-Side Bypasses (Critical)
**File:** `remote/functions/src/index.ts`

### 1.1. Passkey Verification Bypass
- **Status:** `verifyPasskey` function returns `true` immediately.
- **Location:** Around line 164.
- **Risk:** Allows anyone to access any Guest DID's inbox without authentication.
- **Fix:** Remove the `return true;` statement.

### 1.2. DID Authentication Bypass
- **Status:** `verifyAuth` function returns `true` immediately.
- **Location:** Around line 95.
- **Risk:** Allows any DID to authenticate as any other DID (spoofing sender).
- **Fix:** Remove the `return true;` statement.

### 1.3. Dummy Public Key Storage
- **Status:** `parsePasskeyPublicKey` returns a stubbed (dummy) public key.
- **Location:** Around line 12.
- **Reason:** To avoid `cbor-x` crash.
- **Fix:**
    1. Re-enable `cbor-x` (or find alternative CBOR parser).
    2. Uncomment `import ... cbor-x`.
    3. Proper implementation of `parsePasskeyPublicKey` to extract real keys.
    4. **Note:** Existing Guest DIDs created with dummy keys will become invalid and must be recreated.

## 2. Logic & Validation Loose Ends
**File:** `remote/functions/src/index.ts`

### 2.1. `postMessage` Validation Relaxed
- **Status:** Validation changed to allow `did !== hostDid` as long as `did === senderDid`.
- **Location:** Around line 281 `postMessage` resolver.
- **Action:** Review if this "Public Inbox" behavior is the intended design. If strict "Host must post" logic is required, architecture needs review.

### 2.2. `action` Field Undefined
- **Status:** Added conditional check to prevent `undefined` Firestore error.
- **Location:** `postMessage` resolver.
- **Action:** This is likely a permanent fix, but confirm schema optionality.

## 3. Client/CLI Hardcoding
**Files:** `src/folio/send.ts`, `src/folio/transport.ts`, `src/form/guest-did.js`

### 3.1. Localhost Hardcoding
- **Status:** Endpoints and Base URLs are hardcoded to `http://127.0.0.1:5002` or `http://localhost:5002`.
- **Action:** Ensure logic properly falls back to DID Document's `serviceEndpoint` or `did:web` resolution for production URLs (`https://srn.example/...`).
- **Note:** `127.0.0.1` was used to fix Bun fetch issues.

## 4. Next Steps for Resolution
1. **Fix `cbor-x` / WASM Crash:** Investigate why `cbor-x` caused Functions to crash. Could be an import issue or compatibility with the environment.
2. **Restore Verification:** Once real keys are stored, revert bypasses in `verifyPasskey` and `verifyAuth`.
3. **E2E Test:** Verify creating a DID, sending a message, and receiving it WITHOUT any bypasses.
