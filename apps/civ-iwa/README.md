# CIV Demo (IWA Version)

This directory contains the source code for the Isolated Web App (IWA) version of the CIV Demo.
IWA allows bypassing browser restrictions on USB Smart Card (CCID) access.

## Validating & Packaging

To bundle this app into a Signed Web Bundle (`.swbn`), you need the `isolated-web-apps` CLI tool or equivalent.

### Prerequisites

- Chrome 128+ (Enable "Isolated Web Apps" flag if needed)
- **Install Tools**:
  ```bash
  # Using npm
  npm install -g wbn wbn-sign
  
  # OR using Bun
  bun add -g wbn wbn-sign
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
    wbn-sign --input civ-iwa.wbn --private-key private_key.pem --output civ-iwa.swbn
    ```

4.  **Install in Chrome**:
    - **Important**: Must enable `chrome://flags/#enable-isolated-web-app-dev-mode` and restart Chrome first.
    - *Note: On macOS/Windows, this flag might be marked as "Unsupported" depending on the Chrome version. If so, IWA cannot be tested yet.*
    - Go to `chrome://web-app-internals`.
    - Look for the **"IWA Dev Mode"** tab or "Install IWA" section (UI varies by version).
    - If you only see JSON text, verify the flag is enabled.
    - Select your `.swbn` file to install.

### Development

You can simulate IWA mode by enabling "Isolated Web App Developer Mode" in Chrome and utilizing "Install from Proxy" pointing to a local dev server.
