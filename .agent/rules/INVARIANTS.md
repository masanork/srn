# Architectural Invariants

## Web/A Form Principles
1.  **Self-Containment (Single HTML Application)**:
    - Web/A Forms must be standalone.
    - No dependency on external servers for rendering or core logic.
2.  **Asset Inlining**:
    - All critical resources (scripts, styles, postal data, fonts) MUST be inlined (Base64/Blob) into the HTML.
    - Purpose: Ensure offline functionality and bypass `file://` CORS restrictions.
3.  **Privacy by Design**:
    - Do not depend on external CDNs or APIs for validation or autocomplete.
    - Everything needed to fill the form must be inside the container.

## Security
- **Secret Keys**: NEVER commit private keys or secrets to the repository.
- **Immutable L2**: The Layer 2 Payload (Signed Data) must not change during system rebuilds. Use `IdentityManager` to preserve existing signatures.
