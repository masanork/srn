# Changelog

All notable changes to the SRN/Folio project will be documented in this file.

## [Unreleased] - 2025-12-31

### Added
- **Folio Core**: Implemented JPKI digital signature logic (`compute_signature`) and PIN verification (`verify_pin`).
- **Folio CLI**:
    - Added `check` command for JPKI connection diagnostics.
    - Updated `present` command to support real hardware interactions via PC/SC.
    - Added secure PIN handling via `--pin` arg or `FOLIO_JPKI_PIN` env var.
- **JPKI Library**:
    - Extracted generic JPKI logic into a standalone `packages/jpki` crate.
    - Added `jpki` native CLI tool (Rust) for cross-platform card diagnostics (`info`, `cert`, `sign`).
- **Web/A Demo**:
    - Added `WebUsbCcidDriver` for direct browser-to-smartcard communication.
    - Updated `bank-account-opening.html` to demonstrate full "Connect -> Verify -> Sign" flow.

### Changed
- Refactored `packages/folio-core` to depend on the new `jpki` crate.
- Updated WASM bindings to expose JPKI controller methods to JavaScript.
- Replaced mock implementations in `folio-cli` with real PC/SC driver calls (`@pokusew/pcsclite`).

### Fixed
- Verified and fixed WASM build process for `folio-core`.
- Added unit tests for APDU generation, Cryptography (P-256), and Model validation.

### Security
- Removed hardcoded PINs from CLI and test code.
- Added environment variable support for secure PIN injection in CI/CLI environments.
