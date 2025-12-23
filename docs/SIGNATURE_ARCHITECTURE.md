# Sorane (srn) Signature & Key Management Architecture

Sorane utilizes a multi-layered, hybrid cryptographic architecture to ensure long-term security (Post-Quantum Resistance) and high hardware-level security (PassKey integration).

---

## 1. Hybrid Signature Model

Every "Verifiable Signature" in Sorane is **Hybrid**. It combines a traditional "Classic" algorithm with a "Post-Quantum" algorithm.

| Layer | Algorithm | Purpose |
| :--- | :--- | :--- |
| **Classic** | **Ed25519** or **P-256** | Compatibility with existing hardware (YubiKey, TouchID) and libraries. |
| **PQC** | **ML-DSA-44** | Protection against potential future quantum computer attacks. |

**Verification Rule**: A signature is considered valid only if **(Classic) AND (Post-Quantum)** signatures verify successfully.

---

## 2. Key Tiers & Delegation

To balance security (keeping the private key safe) and automation (CI/CD builds), Sorane uses a tiered key structure.

### Tier 1: Root Identity (The "Anchor")
- **Store**: Hardware (PassKey/WebAuthn) or a highly protected `root-identity.json`.
- **Purpose**: Represents the site owner's identity. It is rarely used directly for content signing.
- **Algorithm**: Primarily **P-256** (for PassKey compatibility).

### Tier 2: Delegate Certificate
- **Purpose**: A Verifiable Credential issued by the Root Identity that authorizes a specific "Build Key" to act on its behalf for a limited time (e.g., 7 days).
- **Contains**: The public keys of the authorized Build Key.

### Tier 3: Build Keys (Ephemeral)
- **Store**: Memory or temporary `delegate-key.json` during the build process.
- **Purpose**: Signs the actual contents (HTML, documents, badges).
- **Algorithm**: **Ed25519 + ML-DSA-44** (Hybrid).

---

## 3. Signature Formats

Sorane supports multiple formats depending on the use case:

### A. Hybrid VC (JSON)
- **Standard**: W3C Verifiable Credentials 1.0/2.0.
- **Encoding**: JSON with JCS (JSON Canonicalization Scheme).
- **Use Case**: Human-readable signatures, Digital Badges (`juminhyo`).

### B. Binary COSE VC (CBOR)
- **Standard**: COSE (RFC 9052) / C2PA-like.
- **Encoding**: CBOR (Binary).
- **Use Case**: Embedded signatures in font files, images, or small binary payloads. Optimized for PQC signature sizes.

### C. SD-COSE (Selective Disclosure)
- **Standard**: SD-JWT/SD-CWT inspired.
- **Encoding**: CBOR with salted hashes (`_sd`).
- **Use Case**: Privacy-preserving documents where only specific fields (e.g., "Age > 18" without full Birthday) are revealed.

---

## 4. Build Workflow

1.  **Authorization**: User runs `passkey-authorize.ts`. They use their PassKey to sign a **Delegate Certificate** for an ephemeral **Build Key**.
2.  **Build**: The SSG (`src/index.ts`) detects the authorized Build Key.
3.  **Signing**:
    - Each page/asset is hashed.
    - The **Build Key** creates a Hybrid Signature.
    - The **Delegate Certificate** is attached to the site (e.g., in `.well-known/did.json` or as a separate file).
4.  **Verification**:
    - The verifier checks the content signature using the Build Key.
    - The verifier follows the chain: "Build Key is authorized by Root Identity via Certificate".
    - The verifier confirms the Root Identity is trusted.

---

## 5. Security Benefits
- **No Long-term Secrets on Disk**: Even if a build server is compromised, attackers only get a short-lived ephemeral key.
- **Quantum-Ready**: Data signed today remains confidential and authentic even if quantum computers become viable.
- **Hardware-Backed**: The ultimate authority (Root) remains in the user's secure hardware (PassKey).
