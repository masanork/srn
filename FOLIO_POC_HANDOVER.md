---
title: "Folio POC Implementation Handover & Next Steps"
layout: article
author: "Sorane Tech Lead"
date: 2025-12-31
description: "Status report and remaining tasks for the Folio POC implementation (Rust/WASM + Bun)."
ai_generated: true
status: HANDOVER
---

# Folio POC Implementation Handover

## 1. Current Status

The foundational work for the **Web/A Folio POC** has been completed, including governance approval, technical specification, and the initial implementation of the Rust/WASM core logic.

### Completed Components
*   **Folio Core (`packages/folio-core`)**:
    *   **Architecture**: Rust-based WASM module designed for both CLI and Browser usage.
    *   **JPKI Logic**: Implemented APDU command builders (`apdu.rs`) and a high-level `JpkiController` (`jpki.rs`).
    *   **Cryptography**: Implemented FIDO-compatible P-256 signing/verification (`crypto.rs`) and Juminhyo pattern validation (`model.rs`).
    *   **I/O Abstraction**: Created a `CardReader` trait and a `WebUsbReader` wrapper (`transport.rs`) to bridge Rust and JavaScript WebUSB APIs.
    *   **Build System**: Configured a `build.ts` script using Bun to compile the Rust code to WASM.

*   **Folio CLI (`packages/folio-cli`)**:
    *   Initialized a Bun-based CLI tool.
    *   Created a PC/SC adapter (`src/pcsc.ts`) to bridge Node.js PC/SC libraries with the Rust WASM core.

## 2. Outstanding Issues

### 2.1 Build Environment
The `bun run build` command for `folio-core` was failing in the agent environment. The likely causes and fixes are:
*   **`getrandom` crate**: Added to `Cargo.toml` with `features = ["js"]`. This is crucial for WASM targets.
*   **Build Script Path**: The `cwd` in `build.ts` was corrected to `import.meta.dir`.
*   **Validation**: The build needs to be successfully run to generate the `.wasm` binary.

## 3. Remaining Tasks (Next Steps)

### Priority 1: Verify WASM Build
1.  Run `cd packages/folio-core && bun run build` locally.
2.  Ensure `target/wasm32-unknown-unknown/release/folio_core.wasm` is generated.
3.  Run `wasm-bindgen` (if not automated in build.ts yet) to generate the necessary JavaScript glue code.

### Priority 2: Connect CLI to Core
The CLI is currently using mock logic. It needs to import and use the verified WASM module.
1.  **Wasm Import**: In `packages/folio-cli/src/index.ts` (or `bin/folio.ts`), import the generated WASM module.
2.  **Integrate PC/SC**: Instantiate the `JpkiController` with the `PcscAdapter` (wrapped in a JS object that verified `WebUsbReader` can understand).
3.  **Real JPKI Interaction**: Replace the mock `issue` and `present` commands to actually talk to a physical My Number Card using the Rust logic.

### Priority 3: Browser Demo
1.  Create `sites/demo/bank-account-opening.html`.
2.  Implement the JS side of `WebUsbReader` (using `navigator.usb`).
3.  Load the WASM module and demonstrate the "Form -> VPR -> VP Generation" flow.

## 4. Technical Notes for Successors

*   **Async Interface**: The `CardReader` trait uses `async_trait`. When calling from JS, ensure standard Promises are returned.
*   **Dependency Management**: We are using a unified Bun workspace. Always run `bun install` at the root.
*   **Testing**: `cargo test` covers the logic in `folio-core`. Use it frequently.

## 5. Contact
For questions regarding the architecture or JPKI specifics, refer to the `rust-myna-porting-report.md` and the drafted specifications.
