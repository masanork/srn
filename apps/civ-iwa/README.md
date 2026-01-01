# CIV Demo (IWA Version)

This directory contains the source code for the Isolated Web App (IWA) version of the CIV Demo.
IWA allows bypassing browser restrictions on USB Smart Card (CCID) access.

## Validating & Packaging

To bundle this app into a Signed Web Bundle (`.swbn`), you need the `isolated-web-apps` CLI tool or equivalent.

### Prerequisites

- Chrome 128+ (Enable "Isolated Web Apps" flag if needed)
- `npm install -g @web/bundle-tool` (Example tool, or use Chrome's official tooling)

### Build Steps (Manual)

1. Generate a signing key (Ed25519).
2. Package the `public` directory into a `.swbn` file using the key.
3. Install the `.swbn` in Chrome via `chrome://web-app-internals`.

### Development

You can simulate IWA mode by enabling "Isolated Web App Developer Mode" in Chrome and installing the Unsigned Bundle or pointing to a dev server manifest.
