---
title: "Web/A Folio Onboarding Guide"
date: 2025-12-30
draft: false
tags: ["guide", "folio", "admin"]
---

# Web/A Post Onboarding & Administration Guide

This document outlines the process for setting up a new **Web/A Post** (relay) environment, configuring initial administrative access, and managing user onboarding.

## 1. Initial Setup (Administrator)

To deploy a private or managed **Web/A Post** instance, you must configure the initial administrative authority during deployment.

### A. Generate Admin DID

First, generate a cryptographic identity (DID) that will serve as the "Root Admin" for your instance.

```bash
# Generate a new key-based DID and save it locally
bun run folio did create --save admin-identity
```

Output example:
```
DID: did:key:z6Mkh1...
✅ Key saved to keys/admin-identity.json
```

**Keep this file safe!** It is the only key capable of adding new users if strict mode is enabled.

### B. Configure & Deploy Web/A Post

Set the `ADMIN_DIDS` configuration parameter when deploying the Firebase Functions.

1.  Open `remote/functions/.env` (or set via Firebase CLI).
2.  Add your Admin DID to the list.

```env
ADMIN_DIDS=["did:key:z6Mkh1..."]
```

3.  Deploy the functions:

```bash
cd remote/functions
npm run deploy
```

## 2. User Onboarding Flow

Once the protected remote is running, regular users cannot post messages until they are explicitly added to the allowlist (if `Strict Access Control` is enabled in code).

### Step 1: User Generates DID

The new user generates their own identity using the Folio CLI.

```bash
# User runs on their machine
folio did create --save my-identity
```

The user then sends their **DID string** (e.g., `did:key:zBt3...`) to the Administrator (via email, chat, etc.).

### Step 2: Admin Approves & Adds User

The Administrator uses their Admin Key to register the new user in the system.

*(Note: CLI command for `addUser` is under development. Currently, this can be done via direct GraphQL mutation or a future CLI update.)*

**GraphQL Mutation Example:**

```graphql
mutation AddUser($did: ID!, $nonce: String!, $signature: String!, $newDid: String!) {
  addUser(did: $did, nonce: $nonce, signature: $signature, newDid: $newDid, role: "user")
}
```

### Step 3: Verification

Once added, the user can verify their access by syncing with the remote.

```bash
folio sync --remote https://<your-project>.web.app/api --did <user-did> --key-file keys/my-identity.json
```

## 3. Deployment Modes

The system supports two primary modes of operation, controlled by implementation flags in `src/index.ts`.

| Mode | Description | Suitability |
| :--- | :--- | :--- |
| **Public (Default)** | Anyone with a valid DID can post messages. | Public Relays, Community Servers |
| **Strict (Private)** | Only DIDs in `allowed-users` or `ADMIN_DIDS` can post. | Corporate Intranets, Private Groups |

To enable **Strict Mode**, uncomment the access control logic in `remote/functions/src/index.ts`:

```typescript
// Access Control: Strict Mode
const userDoc = await admin.firestore().collection("allowed-users").doc(did).get();
if (!userDoc.exists && !CONFIG.ADMIN_DIDS.includes(did)) {
     throw new Error("Access Denied: DID not registered.");
}
```

## 4. Guest Access (Passkeys)

Guest DIDs (`did:web:...:guest:...`) are special ephemeral identities created via WebAuthn (Passkeys).
Currently, Guest DIDs are **auto-approved** for the duration of their expiry (default 30 days) to facilitate easy onboarding for non-technical users.

To restrict Guest access, you would need to implement an "Invitation Code" verification within the `createGuestDid` mutation.
