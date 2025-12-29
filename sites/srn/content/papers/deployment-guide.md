---
title: "Web/A Ecosystem Deployment & Operations Guide"
layout: article
author: "Web/A Architecture Team"
date: 2025-12-29
ai_generated: true
---

# Web/A Ecosystem Deployment & Operations Guide

This guide covers the deployment and maintenance of the various components in the Web/A ecosystem, ranging from the static site to high-security PFS backends.

## 1. Architecture Overview: Public vs. Private

The security of Web/A relies on the strict separation of public artifacts and private keys.

| Component | Destination | Sensitivity |
| :--- | :--- | :--- |
| **Form HTML (L1)** | Static Web Server / CDN | Public |
| **Epoch Registry** (`epoch-public.json`) | Static Web Server / CDN | Public |
| **Pre-key Worker** (Cloudflare/Firebase) | Cloudflare Edge / Google Cloud | Public (Handles metadata) |
| **Org Root Key** | Aggregator Local Storage | **CRITICAL PRIVATE** |
| **Epoch/Pre-key Keystores** | Aggregator Local Storage | **CRITICAL PRIVATE** |

---

## 2. Deploying the Static Site (SSG)

Web/A sites are generated as purely static files.

### 2.1. Prerequisites
- [Bun](https://bun.sh) runtime installed.

### 2.2. Build & Deploy
1.  **Install dependencies**:
    ```bash
    bun install
    ```
2.  **Generate the site**:
    ```bash
    bun run build  # Usually triggers src/ssg/index.ts
    ```
3.  **Deploy**:
    Copy the contents of the `dist/` (or equivalent) directory to your web host (GitHub Pages, Vercel, S3, etc.).

---

## 3. Implementing Forward Secrecy (PFS)

### 3.1. Tier 2: Epoch-Based PFS (Static)
This tier requires pre-generating keys for future time windows.

1.  **Generate Keys** (e.g., 90 days):
    ```bash
    bun src/bin/weba-l2-crypto.ts gen-epoch-keys --start 2025-01-01 --days 90 --out ./keys
    ```
2.  **Deploy Public Part**:
    Copy `./keys/epoch-public.json` to your static site (e.g., `/static/keys/`).
3.  **Update Config**:
    Ensure your form config has `l2_epoch_registry_url: "/keys/epoch-public.json"`.

### 3.2. Tier 3: True PFS (Cloudflare Worker)
Recommended for agile deployments and low-latency edge distribution.

1.  **Create D1 Database**:
    ```bash
    bunx wrangler d1 create weba-prekeys
    ```
2.  **Generate Pre-keys**:
    ```bash
    bun src/bin/weba-l2-crypto.ts gen-prekeys --format cloudflare -n 1000 --out ./keys
    ```
3.  **Upload to Cloudflare**:
    ```bash
    bunx wrangler d1 execute weba-prekeys --remote --file ./keys/prekeys-public.sql
    ```
4.  **Deploy Worker**:
    ```bash
    cd src/tools/prekey-worker
    # Edit wrangler.toml with your database_id
    bunx wrangler deploy
    ```

### 3.3. Tier 3 (Alt): True PFS (Firebase / Google Cloud)
Recommended for organizations requiring managed cloud services or specific regional compliance (e.g., ISMAP). This path also allows consolidating site hosting and the PFS backend under a single security boundary.

1.  **Initialize Firebase Project**:
    - Create a project in the Firebase Console.
    - **IMPORTANT (Regional Selection)**: Choose an appropriate region based on your regulatory requirements. For example, if data residency in Japan is required, selecting **`asia-northeast1` (Tokyo)** or **`asia-northeast2` (Osaka)** is recommended.
    - Enable **Cloud Firestore** and **Cloud Functions**.

2.  **Full Firebase Deployment (Hosting + Backend)**:
    ```bash
    bun run build  # Static files into 'dist/srn'
    firebase deploy
    ```

3.  **Import Pre-keys to Firestore**:
    ```bash
    bun src/bin/weba-l2-crypto.ts gen-prekeys --format firebase -n 1000 --out ./keys
    export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
    bun src/tools/prekey-firebase/scripts/import_keys.ts ./keys/prekeys-firebase.json
    ```

---

## 4. Maintenance & Operations

### 4.1. Monitoring Key Expiry
A GitHub Actions workflow is provided in `.github/workflows/alert-key-expiry.yml`. It runs weekly to ensure the `epoch-public.json` has at least 30 days of valid keys remaining.

**If you receive an alert:**
1.  Run the `gen-epoch-keys` command again with a new start date.
2.  Commit and push the updated `epoch-public.json`.

### 4.2. Aggregator Setup (Decryption)
To decrypt messages received via L2 encryption:

1.  Ensure you have your **Private Keystores** (`epoch-private.json`, `prekeys-private.json`) in a secure directory on your local machine.
2.  Run the aggregator:
    ```bash
    bun src/form/aggregator.ts ./submissions --l2-keys ./keys/combined-keys.json
    ```
    *Note: The Aggregator will automatically shred used pre-keys from memory.*

## 6. Cost Estimation & Budgeting (Firebase)

For government, non-profit, or corporate organizations, budgeting is critical. While Web/A can be run for $0, it is important to understand the billing structure.

### 6.1. Plan Selection
- **Spark Plan (Free)**: Best for Tier 1 and Tier 2 deployments. No credit card required. Supports static hosting and Firestore.
- **Blaze Plan (Pay-as-you-go)**: **Required for Tier 3 (Cloud Functions).** Even though it is a paid plan, Google provides a generous free tier that resets every month.

### 6.2. Monthly Cost Simulation (10,000 Submissions/Month)
Assuming 10,000 high-security (Tier 3) submissions per month:

| Service | Component | Usage | Free Tier (Blaze) | Actual Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Hosting** | Data Transfer | 500 MB | 10 GB | $0.00 |
| **Firestore** | Key Consumed | 10,000 writes | 20,000 / day | $0.00 |
| **Functions** | API Invocations | 10,000 calls | 2,000,000 / mo | $0.00 |
| **Cloud Run** | Compute Time | ~500 sec | 180,000 sec | $0.00 |
| **Total** | | | | **$0.00** |

**Conclusion**: For most administrative and small-to-medium scale use cases, the monthly cost will remain at **$0.00**.

---

## 7. Security Best Practices

1.  **Offline Keys**: Never commit `*-private.json` files to Git. They are automatically added to `.gitignore`, but stay vigilant.
2.  **Passphrase Protection**: In production, it is recommended to encrypt the private keystore files at rest using a tool like `gpg` or a dedicated vault.
3.  **WAF Rules**: For Tier 3, enable Rate Limiting on your Cloudflare Worker to prevent "Key Exhaustion" attacks.