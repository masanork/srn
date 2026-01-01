# CIV Demo (IWA Version)

This directory contains the source code for the Isolated Web App (IWA) version of the CIV Demo.
IWA allows bypassing browser restrictions on USB Smart Card (CCID) access.

## Validating & Packaging

To bundle this app into a Signed Web Bundle (`.swbn`), you need the `isolated-web-apps` CLI tool or equivalent.

### Prerequisites

- Chrome 128+ (Enable "Isolated Web Apps" flag if needed)
- **Install Tools via npm**:
  ```bash
  npm install -g wbn wbn-sign
  ```
- **OpenSSL** (usually pre-installed on macOS/Linux)

### Build Steps (Manual)

1.  **Generate Signing Key (Ed25519)**:
    ```bash
    openssl genpkey -algorithm Ed25519 -out private_key.pem
    ```

2.  **Create Unsigned Bundle**:
    Bundle the `public` directory into a `.wbn` file.
    ```bash
    wbn --dir public --output civ-iwa.wbn
    ```

3.  **Sign the Bundle**:
    Sign the bundle with your private key to create the `.swbn` file.
    ```bash
    wbn-sign sign --input civ-iwa.wbn --privateKey private_key.pem --output civ-iwa.swbn
    ```

4.  **Install in Chrome**:
    - Open `chrome://web-app-internals`
    - Click "Install from Bundle" and select `civ-iwa.swbn`.

### Development

You can simulate IWA mode by enabling "Isolated Web App Developer Mode" in Chrome and utilizing "Install from Proxy" pointing to a local dev server.
