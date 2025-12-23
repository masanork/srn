# Feasibility Study: PassKey (WebAuthn) for Issuer Key Management

## 1. Objective
Currently, "Sorane" (srn) manages its Root of Trust using a flat JSON file (`root-key.json`). While simple, this approach has limitations:
- **Security**: The private key is stored on disk (even if ignored by git).
- **Compliance**: Hardware-backed keys are required for higher trust levels.

The goal is to investigate how **PassKeys (WebAuthn)** can be used for Issuer-side key management.

## 2. Technical Constraints

### 2.1 Algorithm Support
| Algorithm | WebAuthn Support | SRN Hybrid Requirement | Match |
| :--- | :--- | :--- | :--- |
| **ES256 (P-256)** | ✅ Universal | ❌ No | No |
| **Ed25519 (EdDSA)** | ⚠️ Emerging (YubiKey 5, iOS 16+) | ✅ Yes (Classic Component) | Partial |
| **ML-DSA (Dilithium)** | ❌ None | ✅ Yes (Quantum Component) | No match |

### 2.2 Execution Environment
- **Node.js/Bun**: Cannot directly trigger WebAuthn ceremonies (requires browser `navigator.credentials`).
- **Local Builds**: User interaction is required for PassKey sensors (TouchID, FaceID, YubiKey).

## 3. Recommended Architectures

### Architecture A: Hardware-Authorized Build Keys (Delegation)
Instead of the PassKey signing every VC, it acts as the **Root Identity** that authorizes ephemeral build keys.

1.  **Bootstrap**:
    - The `did:web` root identity is defined by a PassKey public key (ES256 or Ed25519).
2.  **Ceremony**:
    - At build time, the SSG generates a temporary Hybrid Key Pair.
    - A local web server/pop-up asks the user to sign a "Delegate Certificate" using their PassKey.
    - This certificate grants the temporary key authority to sign for the domain for a short window (e.g., 2 hours).
3.  **Build**:
    - The SSG signs all documents with the temporary key.
    - The site includes the "Delegate Certificate" in its DID configuration or as a separate VC.

### Architecture B: Key Wrapping (Kek)
The PassKey's public key is used to "wrap" (encrypt) the actual Hybrid Root Key stored on disk.
- **Pros**: Matches current file structure.
- **Cons**: WebAuthn is primarily a *signing* API, not an encryption API (though PRF extension exists, support is very limited).

## 4. Proposed PoC Step: "Root Multi-tier Signer"
We can implement a 2-tier signing system as proposed in `PROPOSED_ARCHITECTURE_POLICY.md` using WebAuthn for the top tier.

1.  Create a standalone utility `bun run root:sign-delegate`.
2.  This tool starts a local listener, opens a browser to `localhost:3000`.
3.  The browser executes the WebAuthn `get()` call.
4.  The signature is used to sign a "Build Key" which is then saved to `.ephemeral-key.json`.
5.  The main `build` scripts use this ephemeral key.

## 5. Findings from PoC
- **P-256 Verification Integrated**: `verifyHybridVC` now supports P-256 (ES256) signatures alongside ML-DSA.
- **Delegation Chain Implemented**: `verifyDelegateChain` allows Root Keys (PassKeys) to authorize ephemeral Build Keys.
- **Build Process Integrated**: The SSG now supports `delegate-key.json` and includes the delegation certificate in the distribution.

## 6. Implementation Notes
- **Tool**: `src/tools/passkey-authorize.ts` facilitates the ceremony.
- **Root-of-Trust**: `root-identity.json` represents the hardware-protected identity.
- **Verification**: `verifyDelegateChain(documentVC, delegateCert, rootKey)` provides end-to-end trust.

## 7. Next Steps
1.  [x] Implement Delegate VC structure.
2.  [x] Update build process to support delegated keys.
3.  [ ] Integrate real WebAuthn signature verification in the server tool.
4.  [ ] Explore "Architecture B (Key Wrapping)" for cases where the secret must be recovered.
