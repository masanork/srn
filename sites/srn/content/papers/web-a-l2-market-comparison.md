---
title: "Competitive Analysis: Web/A Layer 2 Encryption vs Legacy & Modern Solutions"
layout: article
author: "Web/A Strategy Team"
date: 2025-12-29
ai_generated: true
---

**Comparison with PPAP, Office Protection, IRM, and Enterprise DLP**

## 1. Executive Summary
This report analyzes the market position of Web/A Layer 2 Encryption by comparing it with widely used legacy methods (PPAP, Office Passwords) and modern enterprise solutions (Office IRM, Hitachi Hibun).

**Conclusion**: Web/A Layer 2 Encryption occupies a unique niche as a **"Serverless, High-Security Data Courier"**. It significantly outperforms legacy methods (PPAP) in security and usability. However, compared to full-suite Enterprise DRM/DLP solutions (IRM, Hibun), it lacks centralized governance features (revoke access, audit logs, print prevention). Its competitive edge lies in **cross-boundary interoperability** (e.g., Organization-to-Citizen, B2B) where centralized directory services (AD) are unavailable.

## 2. Detailed Comparison

### 2.1. vs. PPAP (Zip Encryption with Password)
*Legacy method widely used in Japanese government/enterprises, currently being phased out.*

| Feature | PPAP (Zip) | Web/A L2 Encryption | Verdict |
| :--- | :--- | :--- | :--- |
| **Encryption** | ZipCrypto (Broken) or AES-256 (Strong) | X25519/AES-GCM (HPKE) | **Web/A Wins** |
| **Key Exchange** | **Critical Flaw**: Password sent via same channel (Email) | **Secure**: Public Key embedded in Form. No secret sharing needed. | **Web/A Wins** |
| **Usability** | High friction (Generate Zip, Send PW, Receiver unzip) | Seamless (Auto-encrypt, Browser decrypts) | **Web/A Wins** |
| **Malware Check** | Hard (Encrypted at gateway) | Transparent (L1 is text, L2 is structured JSON) | **Web/A Wins** |

**Analysis**: Web/A L2 effectively kills PPAP. It solves the key distribution problem fundamentally using Public Key Infrastructure (PKI) concepts without the heavy overhead of traditional S/MIME.

### 2.2. vs. Office Document Protection (Password)
*Standard password lock for Excel/Word/PDF.*

| Feature | Office Password | Web/A L2 Encryption | Verdict |
| :--- | :--- | :--- | :--- |
| **Granularity** | Entire file is locked. | Only sensitive payload is locked; Metadata visible. | **Draw** |
| **Key Mgmt** | Symmetric (Password). Must be shared securely (Phone/Chat). | Asymmetric. Encryption key is public. | **Web/A Wins** |
| **Automation** | Hard to automate decryption in pipelines. | Designed for automated CLI/Browser decryption. | **Web/A Wins** |
| **Integrity** | Password does not prevent tampering if cracked. | Digitally signed (Ed25519) + Context Binding. | **Web/A Wins** |

**Analysis**: Office passwords suffer from the same "Shared Secret" problem as PPAP. Web/A allows automated processing of encrypted data, which is difficult with password-protected Excel files.

### 2.3. vs. Microsoft Purview Information Protection (IRM / AIP)
*Enterprise-grade DRM integrated with Azure AD.*

| Feature | Microsoft IRM / AIP | Web/A L2 Encryption | Verdict |
| :--- | :--- | :--- | :--- |
| **Architecture** | **Server-Dependent**: Requires Azure AD / RMS verification. | **Serverless**: File-based. Decryption depends on private key possession. | **Depends** |
| **Control** | **High**: Can revoke access, expire, disable print/copy. | **Low**: Once decrypted, data is raw text. No DRM. | **IRM Wins** |
| **External Use** | Difficult. Requires Guest Accounts in AD. | **Easy**: Works with anyone (Public internet, offline). | **Web/A Wins** |
| **Cost** | High (E3/E5 Licenses). | Free (Open Protocol). | **Web/A Wins** |

**Analysis**: Web/A cannot compete with IRM for internal document control (e.g., "Internal Eyes Only"). However, for **collecting data from the outside world** (Citizens, Customers) where users do not have AD accounts, IRM is impractical, and Web/A shines.

### 2.4. vs. Hitachi Hibun (Data Encryption / DLP)
*Japanese domestic standard for endpoint security.*

| Feature | Hitachi Hibun | Web/A L2 Encryption | Verdict |
| :--- | :--- | :--- | :--- |
| **Scope** | **Endpoint/OS Layer**. Encrypts files/USB automatically. | **Application Layer**. Encrypts form data inside HTML/JSON. | **Different** |
| **Enforcement** | Mandatory (IT Admin enforces policy). | Voluntary (User or Form Designer enables). | **Hibun Wins** |
| **Deployment** | **High Friction**: Requires OS agent installation & reboot. | **Zero-Touch**: Runs in standard browsers (Chrome/Edge/Safari). | **Web/A Wins** |
| **Portability** | Requires Hibun client on receiver side (or decrypt tool). | Requires standard Browser only. | **Web/A Wins** |
| **Lock-in** | Vendor Proprietary. | Open Standard (JSON/HPKE). | **Web/A Wins** |

**Analysis**: Hibun is for "preventing employees from leaking data". Web/A is for "securely transporting data between entities". They are complementary. Web/A could be the *format* used to transport data that Hibun protects at the endpoint.

### 2.5. vs. PGP/GPG & Age (Modern File Encryption)
*Standard tools for file encryption used by technical experts and whistleblowers.*

| Feature | PGP / GPG | Age (Actually Good Encryption) | Web/A L2 Encryption |
| :--- | :--- | :--- | :--- |
| **Key Distribution** | Complex (Key Servers, Web of Trust) | Manual (SSH keys, Bech32 keys) | **Embedded**: Enc. Key is inside the L1 Form. |
| **UX / Friction** | High (Requires specialized software) | Moderate (CLI-based) | **Zero**: Decrypts in a standard browser. |
| **PQC Resistance** | Difficult (requires specific plugins) | Under discussion | **Standard**: X25519+ML-KEM-768 Hybrid. |
| **Metadata Hide** | Low (filename often leaked) | High | **High**: Only encrypted payload is binary. |

**Analysis**: While PGP/Age are excellent for peer-to-peer technical communication, they fail in "Government-to-Citizen" scenarios due to high friction. Web/A L2 provides the same security level with Web-native UX.

### 2.6. vs. DIDComm (Hyperledger Aries / SSI)
*The communication layer for Self-Sovereign Identity (SSI).*

| Feature | DIDComm / SSI | Web/A L2 Encryption |
| :--- | :--- | :--- |
| **Nature** | **Interactive**: Requires session/connection. | **Asynchronous**: Entirely file-based (offline). |
| **Identity** | Bound to DIDs (Decentralized IDs). | Identity-Agnostic (Key-to-Key). |
| **Transport** | Requires mediator nodes / HTTP endpoints. | **Universal**: Email, USB, IPFS, Folders. |
| **Verification** | Blockchain/VDR dependent (often). | **Self-Contained**: Binds to Layer 1 hash. |

**Analysis**: DIDComm is superior for ongoing relationships (e.g., Bank-to-Customer). Web/A L2 is superior for **one-off or periodic submissions** where establishing a persistent connection is unnecessary overhead.

## 3. Evaluation Matrix

| Criterion | Weight | PPAP | Office PW | Office IRM | Web/A L2 | PGP/Age | DIDComm |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Security Strength** | High | 1 | 2 | 5 | **4** | 5 | 5 |
| **Zero-Touch (No Install)** | High | 5 | 5 | 1 | **5** | 1 | 2 |
| **UX (Ease of Use)** | Med | 2 | 3 | 3 | **5** | 1 | 2 |
| **Ext. Interop** | Med | 5 | 5 | 1 | **5** | 2 | 3 |
| **Server Independence**| Med | 5 | 5 | 1 | **5** | 5 | 2 |
| **Total Score** | | **Low** | **Low-Mid** | **Mid (Int)**| **High (Zero)**| **Mid (Exp)** | **Mid (Rel)** |

*   **Zero**: Dominant in Zero-Touch/Zero-Trust scenarios.

*   **Int**: Strong for Internal use (Azure/AD dependency).
*   **Ext**: Strong for External/Cross-boundary use.
*   **Expert**: Requires technical expertise.
*   **Rel**: Strong for persistent relationships.

## 4. Strategic Positioning & Future Challenges

### 4.1. The "Zero Trust" Gap
Modern Zero Trust architectures (ZTA) rely on **Identity-Aware Proxies** and continuous authentication.
*   **Challenge**: Web/A is "Identity-Agnostic" at the transport layer (it relies on payload signatures). It does not natively integrate with ZTA policy engines (e.g., "Allow submission only from compliant devices").
*   **Opportunity**: Web/A L2 can serve as the **Payload Protection** mechanism *within* a Zero Trust tunnel, providing defense-in-depth (Encryption at Application Layer).

### 4.2. SaaS Form Competitors (Google Forms, MS Forms, Typeform)
*   **Strength**: Zero setup, instant analysis.
*   **Weakness**: Data resides in the vendor's cloud. US CLOUD Act concerns for some governments.
*   **Web/A Advantage**: **Data Sovereignty**. The data (L2 Payload) never leaves the user's control until they send it, and it goes directly to the recipient without a SaaS middleman storage.

### 4.4. Decoupling from Centralized Identity
Unlike Microsoft IRM (Azure AD) or DIDComm (often relying on DIDs registered in VDRs), Web/A L2 works as a **purely functional cryptographic pipe**.
*   It protects data using keys derived from the context itself (`layer1_ref`).
*   This makes it ideal for "Cold Start" scenarios where a citizen without a digital wallet or a corporate account needs to send highly sensitive data to a government office securely and instantly.

### 4.5. The "BYOD & Legacy IT" Neutralizer (Zero-Touch)
The most significant competitive advantage in regulated environments is that Web/A is **data, not an application**.
*   **Avoids "Shadow IT" Red Flags**: Since it requires no installation, it does not trigger endpoint protection alerts or require administrator privileges.
*   **Bypasses Infrastructure Silos**: In large organizations, upgrading an OS or installing a new security agent (like Hibun or IRM) can take months or years. Web/A can be deployed **instantly** as part of a business project because it leverages the existing, already-approved browser sandbox.
*   **Neutralizes Compatibility Risks**: Works equally well on a managed Windows PC, a personal iPhone, or a Linux workstation without any platform-specific porting.

### 4.6. Responsibility Boundaries & the SaaS Gap
Enterprise solutions often enforce strict **responsibility boundaries** (who is
allowed to touch, store, and process data). This is a valid governance model,
but it creates a practical gap: real-world data flows still cross boundaries.
That gap is one reason **PPAP and paper/Excel handoffs persist**.

Web/A does not remove boundaries; it **carries responsibility across them** by
binding data to signatures and context. When data crosses an organizational
boundary, re-signing and explicit consent can re-establish accountability
without forcing a shared platform. This frames the **SaaS Gap** as a governance
issue rather than a tooling failure.

### 4.3. Future Roadmap for Competitiveness
To compete with Enterprise IRM and SaaS:
1.  **Auditable Aggregators**: Develop open-source aggregators that generate audit logs (who decrypted what, when), mimicking IRM governance.
2.  **Hardware Token Support**: Beyond WebAuthn, support direct smart card (PKCS#11) integration for government use cases (My Number Card employee ID).
3.  **Ephemeral Key Servers**: Implement a light-weight "Key Exchange Server" (optional) to solve the Forward Secrecy issue, bridging the gap with TLS-based security.

## 5. Conclusion
Web/A Layer 2 Encryption is not a replacement for Enterprise DLP (Hibun) or Internal DRM (IRM). Instead, it is the **modern successor to PDF/Excel forms sent via email**. It provides the security of PKI with the convenience of a file, making it the ideal choice for **Government-to-Citizen (G2C)** and **Business-to-Business (B2B)** data collection scenarios where shared infrastructure does not exist.
